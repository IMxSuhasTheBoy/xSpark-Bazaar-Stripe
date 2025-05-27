"use client";

import { InboxIcon } from "lucide-react";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { cn } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";

import { ProductCard, ProductCardSkeleton } from "./product-card";
import { useProductFilters } from "../../hooks/use-product-filters";

interface Props {
  category?: string;
  tenantSlug?: string;
  narrowView?: boolean;
}

export const ProductList = ({ category, tenantSlug, narrowView }: Props) => {
  const [filters] = useProductFilters();

  const trpc = useTRPC();
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          ...filters,
          category,
          tenantSlug,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        },
      ),
    );

  if (data.pages?.[0]?.docs.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded-lg border border-dashed border-black bg-white p-8">
        <InboxIcon />
        <p className="text-base font-medium">No products found</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded-lg border border-dashed bg-white p-8">
        <p className="text-base font-medium">Failed to load products</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
          narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3",
        )}
      >
        {data?.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              tenantSlug={product.tenant?.slug}
              tenantImageUrl={product.tenant?.image?.url}
              imageUrl={product.image?.url}
              price={product.price}
              reviewCount={product.reviewCount}
              reviewRating={product.reviewRating}
            />
          ))}
      </div>

      <div className="flex justify-center pt-8">
        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="elevated"
            className="bg-white text-base font-medium disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        )}
      </div>
    </>
  );
};

export const ProductListSkeleton = ({ narrowView }: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3",
      )}
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
