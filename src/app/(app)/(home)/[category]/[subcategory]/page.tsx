import type { SearchParams } from "nuqs/server";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc, getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<SearchParams>;
}
const Page = async ({ params, searchParams }: Props) => {
  const { subcategory } = await params;
  const filters = await loadProductFilters(searchParams);

  // strategy: component for prefetching data then suspense loading in the client component (ProductList)
  const queryClient = getQueryClient();

  // prefetch categories data server-side to leverage React Server Components for improved initial load performance
  await queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: subcategory,
      limit: DEFAULT_LIMIT,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  );
};

export default Page;
