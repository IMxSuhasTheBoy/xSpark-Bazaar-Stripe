import { Suspense } from "react";

import { trpc, getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  ProductList,
  ProductListSkeleton,
} from "@/modules/Products/ui/components/product-list";

interface Props {
  params: Promise<{ subcategory: string }>;
}

const Page = async ({ params }: Props) => {
  const { subcategory } = await params;

  // Prefetch subcategories data server-side to leverage React Server Components for improved initial load performance
  // strategy: component for prefetching data then suspense loading in the client component (ProductList)
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      category: subcategory,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        {/* Using subcategory as category since we're in the subcategory route */}
        <ProductList category={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
