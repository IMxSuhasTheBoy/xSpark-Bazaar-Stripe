import { z } from "zod";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/constants";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Review, Tenant } from "@/payload-types";

import { sortValues } from "../search-params";

interface ReviewsByProductId {
  [productId: string]: Review[];
}

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        depth: 2, // "product.image", "product.cover", "product.tenant", "product.tenant.image" and"product.tenant.cover"
        id: input.id,
        select: {
          content: false, // do not fetch content field
        },
      });

      let isPurchased = false;

      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: { equals: input.id },
              },
              {
                user: { equals: session.user.id },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
      }

      // Fetch reviews for the product to summarize them
      const reviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: { equals: input.id },
        },
      });

      const reviewRating =
        reviewsData.docs.length > 0
          ? reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviewsData.docs.length
          : 0;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (reviewsData.totalDocs > 0) {
        reviewsData.docs.forEach((review) => {
          const rating = review.rating;

          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });

        // Convert the rating distribution to an array of objects
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;
          ratingDistribution[rating] = Math.round(
            (count / reviewsData.docs.length) * 100,
          );
        });
      }

      return {
        ...product,
        isPurchased,
        image: product.image as Media | null,
        cover: product.cover as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        reviewRating,
        reviewCount: reviewsData.totalDocs,
        ratingDistribution,
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = "-createdAt";

      // sort filters
      if (input.sort === "curated") {
        sort = "-createdAt";
      }

      if (input.sort === "new") {
        sort = "-createdAt";
      }

      if (input.sort === "trending") {
        sort = "+createdAt";
      }

      // price filters
      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
        };
      } else if (input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice,
        };
      }

      // tenant filters (query by a tenant)
      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      }

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1, // Control relationship depth for populating subcategories, subcategories.[0] will be of type "Category".
          pagination: false,
          where: {
            slug: { equals: input.category },
          },
        }); // query db

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((subDoc) => ({
            // because of "depth: 1" we are confident "doc"  wil be a type of "Category".
            ...(subDoc as Category),
            subcategories: undefined,
          })),
        }));

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug,
            ),
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Control relationship depth for populating "category", "image", "tenant" & "tenant.image".
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false, // do not fetch content field
        },
      }); // query db

      // batch fetching reviews and then matching them to products in memory:
      // fetch all reviews for all products in a single query
      const productsIds = data.docs.map((doc) => doc.id);
      const allReviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: { in: productsIds },
        },
      }); // query db

      // group reviews by product id with proper typing
      const reviewsByProductId = allReviewsData.docs.reduce<ReviewsByProductId>(
        (acc, review) => {
          // product field from Review type is string | Product, we want the string (ID)
          const productId =
            typeof review.product === "string"
              ? review.product
              : review.product.id;
          if (!acc[productId]) {
            acc[productId] = [];
          }
          acc[productId].push(review);
          return acc;
        },
        {},
      );

      // map product data with review summaries
      const dataWithSummarizedReviews = data.docs.map((doc) => {
        const productReviews = reviewsByProductId[doc.id] || [];
        const reviewCount = productReviews.length;
        const rawAverage =
          reviewCount === 0
            ? 0
            : productReviews.reduce((acc, review) => acc + review.rating, 0) /
              reviewCount;
        const reviewRating = Math.round(rawAverage * 100) / 100; // round to two decimal places

        return {
          ...doc,
          reviewCount,
          reviewRating,
        };
      });

      // typeof image is assigned as Media type individually
      return {
        ...data,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          cover: doc.cover as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
