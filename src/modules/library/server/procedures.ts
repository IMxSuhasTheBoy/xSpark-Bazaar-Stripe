import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { Media, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

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
      });

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
        depth: 0, // Control relationship depth for just ids
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
      });

      return {
        ...productsData,
        docs: productsData.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          cover: doc.cover as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
