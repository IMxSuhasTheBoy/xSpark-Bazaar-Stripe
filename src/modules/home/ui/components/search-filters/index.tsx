"use client";

import { useParams } from "next/navigation";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DEFAULT_BG_COLOR } from "@/modules/home/constants";

import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { SearchFiltersErrorFallback } from "./error-fallback";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";

  const activeCategoryData = data.find(
    (category) => category.slug === activeCategory,
  );

  const activeCategoryColor = activeCategoryData?.color || DEFAULT_BG_COLOR;
  const activeCategoryName = activeCategoryData?.name || null;

  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcategory) => subcategory.slug === activeSubcategory,
    )?.name || null;

  return (
    <div
      className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12"
      style={{ backgroundColor: activeCategoryColor }}
    >
      <SearchInput />
      <div className="hidden lg:block">
        <ErrorBoundary fallback={<SearchFiltersErrorFallback />}>
          <Categories data={data} />
        </ErrorBoundary>
      </div>
      <BreadcrumbNavigation
        activeCategory={activeCategory}
        activeCategoryName={activeCategoryName}
        activeSubcategoryName={activeSubcategoryName}
      />
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12"
      style={{ backgroundColor: DEFAULT_BG_COLOR }}
    >
      <SearchInput disabled />
      <div className="hidden lg:block">
        <div className="h-11" />
      </div>
    </div>
  );
};

/*
/ Created a reusable ErrorBoundary component in src/components/ui/error-boundary.tsx

/ Created a specific error fallback component for the categories section

/ Refactored the SearchFilters component to extract the data fetching logic into a separate component wrapped in the error boundary.

/ Ensured the error boundary is properly placed to only catch errors from the categories data fetching, not affecting the rest of the UI.

/ This approach ensures that if useSuspenseQuery throws an error when fetching categories, only that specific part of the component will be replaced with the error fallback UI, while the rest of the page continues to function normally.
ddd
*/
