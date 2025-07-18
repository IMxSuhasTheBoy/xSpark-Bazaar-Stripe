"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoriesGetManyOutput } from "@/modules/categories/types";

import { SubcategoryMenu } from "./subcategory-menu";

type CategoryItem = CategoriesGetManyOutput[number];

interface Props {
  category: CategoryItem;
  isActive?: boolean;
  isNavigationHoverd?: boolean;
}

export const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHoverd,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => {
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => setIsOpen(false);


  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative">
        <Link href={`/${category.slug === "all" ? "" : category.slug}`}>
          <Button
            variant="elevated"
            className={cn(
              "hover:border-primary h-11 rounded-full border-transparent bg-transparent text-black hover:bg-white",
              isActive && !isNavigationHoverd && "border-primary bg-white",
              isOpen &&
                "border-primary -translate-x-[4px] -translate-y-[4px] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            )}
          >
            {category.name}
          </Button>
        </Link>

        {category.subcategories && category.subcategories.length > 0 && (
          <div
            className={cn(
              "absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-r-[10px] border-b-[10px] border-l-[10px] border-r-transparent border-b-black border-l-transparent opacity-0",
              isOpen && "opacity-100",
            )}
          />
        )}
      </div>

      <SubcategoryMenu
        category={category}
        isOpen={isOpen}
      />
    </div>
  );
};
