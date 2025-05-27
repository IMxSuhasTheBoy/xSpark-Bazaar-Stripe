import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { Media, Review, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

interface ReviewsByProductId {
  [productId: string]: Review[];
}

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0, // Control relationship depth for just ids
        pagination: false,
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      }); // query db

      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "libraryRouter: getOne: Order not found",
        });
      }

      const product = await ctx.db.findByID({
        collection: "products",
        // depth: 2, // Control relationship depth for populating "category", "image", "tenant" & "tenant.image".
        id: input.productId,
      }); // query db

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "libraryRouter: getOne: Product not found",
        });
      }

      return product;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0,
        limit: input.limit,
        page: input.cursor,
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
      }); // query db

      const productIds = ordersData.docs.map((order) => order.product);

      // validation for empty product IDs array. If a user has orders but no valid product IDs, the products query might behave unexpectedly.
      if (productIds.length === 0) {
        return {
          docs: [],
          totalDocs: 0,
          limit: input.limit,
          totalPages: 0,
          page: input.cursor,
          pagingCounter: input.cursor,
          hasPrevPage: input.cursor > 1,
          hasNextPage: false,
          prevPage: input.cursor > 1 ? input.cursor - 1 : null,
          nextPage: null,
        };
      }

      const productsData = await ctx.db.find({
        collection: "products",
        pagination: false,
        // depth: 2, // Control relationship depth for populating "category", "image", "tenant" & "tenant.image".
        where: {
          id: {
            in: productIds,
          },
        },
      }); // query db

      // batch fetching reviews and then matching them to products in memory:
      // fetch all reviews for all products in a single query
      const productsIds = productsData.docs.map((doc) => doc.id);
      const allReviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            in: productsIds,
          },
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
      const dataWithSummarizedReviews = productsData.docs.map((doc) => {
        const productReviews = reviewsByProductId[doc.id] || [];
        const reviewCount = productReviews.length;
        const reviewRating =
          reviewCount === 0
            ? 0
            : productReviews.reduce((acc, review) => acc + review.rating, 0) /
              reviewCount;
        return {
          ...doc,
          reviewCount,
          reviewRating,
        };
      });

      return {
        ...productsData,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          cover: doc.cover as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});

/*
 const dataWithSummarizedReviews = await Promise.all(
        productsData.docs.map(async (doc) => {
          // Fetch reviews for each product to summarize them
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          return {
            ...doc,
            reviewCount: reviewsData.totalDocs,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0,
                  ) / reviewsData.totalDocs,
          };
        }),
      );

*/
