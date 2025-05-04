import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

/* type alias for the output of products.getMany using tRPC inference */

export type ProductsGetManyOutput =
  inferRouterOutputs<AppRouter>["products"]["getMany"];
