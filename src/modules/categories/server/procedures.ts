import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.find({
        collection: "categories",
        depth: 1, // Control relationship depth for populating subcategories, subcategories.[0] will be of type "Category".
        pagination: false,
        where: {
          parent: {
            exists: false,
          },
        },
        sort: "name",
      }); // query db

      const formattedData = data.docs.map((doc) => ({
        ...doc,
        subcategories: (doc.subcategories?.docs ?? []).map((subDoc) => ({
          // because of "depth: 1" we are confident "doc"  wil be a type of "Category".
          ...(subDoc as Category),
          subcategories: undefined,
        })),
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
        cause: error,
      });
    }
  }),
});
