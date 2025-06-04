import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";

import { Navbar } from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";
import {
  SearchFilters,
  SearchFiltersSkeleton,
} from "@/modules/home/ui/components/search-filters";

interface Props {
  children: React.ReactNode;
}

// Prefetch categories data server-side to leverage React Server Components for improved initial load performance
const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F0]">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

/*
data:
[
  {
    "name": "Categorie1",
    "color": "#FFB347",
    "slug": "categorie1",
    "subcategories": {
      "docs": [
        {
          "name": "Categorie1sub1",
          "slug": "categorie1sub1",
          "parent": "68034114d2ad137981185940",
          "subcategories": {
              "docs": [],
              "hasNextPage": false
          },
          "id": "6803afdf3f7d73bb275a4773"
        }
      ],
      "hasNextPage": false
    },
    "id": "68034114d2ad137981185940"
  }
]


formatedData:
[
  {
    "name": "Categorie1",
    "color": "#FFB347",
    "slug": "categorie1",
    "subcategories": [
      {
        "name": "Categorie1sub1",
        "slug": "categorie1sub1",
        "parent": "68034114d2ad137981185940",
        "id": "6803afdf3f7d73bb275a4773"
      }
    ],
    "id": "68034114d2ad137981185940"
  }
]
*/
