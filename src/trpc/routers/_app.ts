/* main tRPC app router, integrating the categories router and exporting types */

import { createTRPCRouter } from "../init";

import { authRouter } from "@/modules/auth/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { productsRouter } from "@/modules/Products/server/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  categories: categoriesRouter,
  products: productsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
