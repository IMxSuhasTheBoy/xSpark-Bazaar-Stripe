import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const checkoutRouter = createTRPCRouter({
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.find({
          collection: "products",
          depth: 2, // Control relationship depth for populating "category", "image", "tenant" & "tenant.image".
          where: {
            id: {
              in: input.ids,
            },
          },
        }); // query db

        // TODO:Solution required for: case when database is missing products but since cart store is independent on slient localstorage, what to do with the products present incart but no longer exists in db
        if (data.totalDocs !== input.ids.length) {
          console.log(input.ids.length, data.totalDocs);
          // throw new TRPCError({
          //   code: "NOT_FOUND",
          //   message: "Products not found",
          // });
        }

        // typeof image is assigned as Media type individually
        return {
          ...data,
          totalPrice: data.docs.reduce((acc, doc) => acc + doc.price, 0),
          docs: data.docs.map((doc) => ({
            ...doc,
            image: doc.image as Media | null,
            cover: doc.cover as Media | null,
            tenant: doc.tenant as Tenant & { image: Media | null },
          })),
        };
      } catch (error) {
        console.error("Error fetching products: checkoutRouter", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
          cause: error,
        });
      }
    }),
});
