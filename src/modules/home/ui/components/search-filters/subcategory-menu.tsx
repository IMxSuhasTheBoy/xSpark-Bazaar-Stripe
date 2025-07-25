import Link from "next/link";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

type CategoryItem = CategoriesGetManyOutput[number];
type SubcategoryItem = CategoryItem["subcategories"][number];

interface Props {
  category: CategoryItem;
  isOpen: boolean;
}

export const SubcategoryMenu = ({ category, isOpen }: Props) => {
  if (
    !isOpen ||
    !category.subcategories ||
    category.subcategories.length === 0
  ) {
    return null;
  }

  const backgroundColor = category.color || "#F5F5F5";

  return (
    <div className="absolute top-full left-0 z-100">
      {/* Invisible bridge to maintain hover between gap of dropdown menu & category btn */}
      <div className="h-3 w-60" aria-hidden="true" />
      <div
        style={{ backgroundColor }}
        className="w-60 -translate-x-[2px] -translate-y-[2px] overflow-hidden rounded-md border text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div>
          {category.subcategories?.map((subcategory: SubcategoryItem) => (
            <Link
              key={subcategory.slug}
              href={`/${category.slug}/${subcategory.slug}`}
              className="flex w-full items-center justify-between p-4 text-left font-medium underline hover:bg-black hover:text-white"
            >
              {typeof subcategory === "string" ? subcategory : subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
