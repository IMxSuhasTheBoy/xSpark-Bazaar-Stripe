import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc, getQueryClient } from "@/trpc/server";

import { LibraryView } from "@/modules/library/ui/views/library-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
};

export default Page;
