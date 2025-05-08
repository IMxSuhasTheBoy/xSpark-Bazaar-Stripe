"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useProductFilters } from "../../hooks/use-product-filters";

export const ProductSort = () => {
  const [filters, setFilters] = useProductFilters();
  const sortOptions: {
    value: "curated" | "trending" | "new";
    label: string;
  }[] = [
    { value: "curated", label: "Curated" },
    { value: "trending", label: "Trending" },
    { value: "new", label: "New" },
  ];

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
          onClick={() => {
            setFilters({ sort: option.value });
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
