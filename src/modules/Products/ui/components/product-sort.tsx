"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useProductFilters } from "../../hooks/use-product-filters";

export const ProductSort = () => {
  const [filters, setFilters] = useProductFilters();

  const sortOptions = useMemo(
    () =>
      [
        { value: "curated", label: "Curated" },
        { value: "trending", label: "Trending" },
        { value: "new", label: "New" },
      ] as const,
    [],
  );

  const handleSort = useCallback(
    (value: "curated" | "trending" | "new") => {
      if (filters.sort !== value) {
        setFilters({ sort: value });
      }
    },
    [filters.sort, setFilters],
  );

  return (
    <div className="flex items-center gap-2">
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant="secondary"
          className={cn(
            "rounded-full bg-white hover:bg-white",
            filters.sort !== option.value &&
              "hover:border-border border-transparent bg-transparent hover:bg-transparent",
          )}
          onClick={() => handleSort(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
