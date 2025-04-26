import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
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

    const formatedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs || []).map((subDoc) => ({
        // because of "depth: 1" we are confident "doc"  wil be a type of "Category".
        ...(subDoc as Category),
        subcategories: undefined,
      })),
    }));

    return formatedData;
  }),
});
