"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useProductFilters } from "../../hooks/use-product-filters";

export const ProductSort = () => {
  const [filters, setFilters] = useProductFilters();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "curated" &&
            "hover:border-border border-transparent bg-transparent hover:bg-transparent",
        )}
        onClick={() => {
          setFilters({ sort: "curated" });
        }}
      >
        Curated
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "trending" &&
            "hover:border-border border-transparent bg-transparent hover:bg-transparent",
        )}
        onClick={() => {
          setFilters({ sort: "trending" });
        }}
      >
        Trending
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "new" &&
            "hover:border-border border-transparent bg-transparent hover:bg-transparent",
        )}
        onClick={() => {
          setFilters({ sort: "new" });
        }}
      >
        New
      </Button>
    </div>
  );
};
