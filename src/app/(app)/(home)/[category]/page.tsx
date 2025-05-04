import { Suspense } from "react";

import { trpc, getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  ProductList,
  ProductListSkeleton,
} from "@/modules/Products/ui/components/product-list";

interface Props {
  params: Promise<{ category: string }>;
}

const Page = async ({ params }: Props) => {
  const { category } = await params;
  // prefetch categories data server-side to leverage React Server Components for improved initial load performance
  // strategy: component for prefetching data then suspense loading in the client
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      category,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList category={category} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
