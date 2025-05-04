import { z } from "zod";
import { Where } from "payload";

import { TRPCError } from "@trpc/server";
import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1, // Control relationship depth for populating subcategories, subcategories.[0] will be of type "Category".
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        // console.log(JSON.stringify(categoriesData, null, 2)); test

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
        }

        where["category.slug"] = {
          in: [parentCategory.slug, ...subcategoriesSlugs],
        };
      }

      try {
        const data = await ctx.db.find({
          collection: "products",
          depth: 1, // Control relationship depth for populating category & image.
          where,
        }); // query db

        return data;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
          cause: error,
        });
      }
    }),
});
