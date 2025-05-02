/* main tRPC app router, integrating the categories router and exporting types */

import { authRouter } from "@/modules/auth/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  categories: categoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
