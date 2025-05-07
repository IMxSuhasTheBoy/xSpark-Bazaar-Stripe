"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useProductFilters } from "../../hooks/use-product-filters";

interface Props {
  category?: string;
}

export const ProductList = ({ category }: Props) => {
  const [filters] = useProductFilters();

  const trpc = useTRPC();
  const { data, error } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({
      category,
      ...filters,
    }),
  );

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Failed to load products</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {data?.docs.map((product) => (
        <div key={product.id} className="rounded-md border bg-white p-4">
          <h2>{product.name}</h2>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-md border bg-white p-4">
          <div className="h-4 w-full animate-pulse bg-gray-200" />
          <div className="mt-2 h-4 w-full animate-pulse bg-gray-200" />
          <div className="mt-2 h-4 w-full animate-pulse bg-gray-200" />
          <div className="mt-2 h-4 w-full animate-pulse bg-gray-200" />
          <div className="mt-2 h-4 w-full animate-pulse bg-gray-200" />
        </div>
      ))}
    </div>
  );
};
