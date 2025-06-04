import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

/* type alias for the output of products.getMany using tRPC inference for type-safe tRPC product queries. */

export type ProductsGetManyOutput =
  inferRouterOutputs<AppRouter>["products"]["getMany"];
