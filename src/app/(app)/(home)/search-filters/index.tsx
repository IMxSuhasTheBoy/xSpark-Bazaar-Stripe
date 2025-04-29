"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/error-boundary";

import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { SearchFiltersErrorFallback } from "./error-fallback";

const CategoriesWithQuery = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  return <Categories data={data} />;
};

export const SearchFilters = () => {
  return (
    <div
      className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12"
      style={{ backgroundColor: "#F5F5F5" }}
      //TODO: make it dynamic. WARNINIG: Using style={{ backgroundColor: "#F5F5F5" }} bypasses the design-token pipeline and hampers theming/dark-mode tweaks.
    >
      <SearchInput />
      <div className="hidden lg:block">
        <ErrorBoundary fallback={<SearchFiltersErrorFallback />}>
          <CategoriesWithQuery />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12"
      style={{ backgroundColor: "#F5F5F5" }}
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
