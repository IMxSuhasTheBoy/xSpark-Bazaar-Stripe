/* hierarchical category navigation in a sidebar,
handling open state, navigation, and dynamic background color */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

type CategoryItem = CategoriesGetManyOutput[number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoriesSidebar = ({ open, onOpenChange }: Props) => {
  const trpc = useTRPC();
  const { data, isError } = useQuery(trpc.categories.getMany.queryOptions());

  const router = useRouter();

  const [parentCategories, setParentCategories] =
    useState<CategoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null,
  );

  // If we have parent categories show those, otherwise show root categories
  const currentCategories = parentCategories ?? data ?? [];

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  };

  // Show error message if query fails
  if (isError) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="left" className="p-0 transition-none">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Categories</SheetTitle>
          </SheetHeader>
          <div className="flex h-full items-center justify-center p-4 text-center">
            <p>Error loading categories. Please try again later.</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handleCategoryClick = (category: CategoryItem) => {
    if (category.subcategories && category.subcategories.length > 0) {
      // The subcategories are already in the correct format from the server
      setParentCategories(
        category.subcategories as unknown as CategoriesGetManyOutput,
      );
      setSelectedCategory(category);
    } else {
      // This is a leaf category (no subcategories)
      if (parentCategories && selectedCategory) {
        // This is a subcategory, navigate to /category/subcategory
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        // This is a root category, navigate to /category
        if (category.slug === "all") {
          router.push(`/`);
        } else {
          router.push(`/${category.slug}`);
        }
      }

      handleOpenChange(false);
    }
  };

  const handleBackClick = () => {
    if (parentCategories) {
      setParentCategories(null);
      setSelectedCategory(null);
    }
  };

  const backgroundColor = selectedCategory?.color || "white";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor }}
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>

        {!currentCategories.length && (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <p>No categories available</p>
          </div>
        )}

        {currentCategories.length > 0 && (
          <ScrollArea className="flex h-full flex-col overflow-y-auto pb-2">
            {parentCategories && (
              <button
                onClick={handleBackClick}
                aria-label="Go back to main categories"
                className="flex w-full items-center p-4 text-left text-base font-medium hover:bg-black hover:text-white"
              >
                <ChevronLeftIcon className="mr-2 size-4" />
                Back
              </button>
            )}
            {currentCategories.map((category) => (
              <button
                key={category.slug}
                onClick={() => handleCategoryClick(category)}
                // keyboard navigation support
                aria-expanded={
                  selectedCategory?.slug === category.slug &&
                  category.subcategories &&
                  category.subcategories.length > 0
                }
                aria-haspopup={
                  category.subcategories && category.subcategories.length > 0
                    ? "true"
                    : "false"
                }
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left text-base font-medium hover:bg-black hover:text-white"
              >
                {category.name}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <ChevronRightIcon className="size-4" aria-hidden="true" />
                  )}
              </button>
            ))}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};
