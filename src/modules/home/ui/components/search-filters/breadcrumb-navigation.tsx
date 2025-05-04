import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
  activeCategory?: string | null;
  activeCategoryName?: string | null;
  activeSubcategoryName?: string | null;
  disabled?: boolean;
}

export const BreadcrumbNavigation = ({
  activeCategory,
  activeCategoryName,
  activeSubcategoryName,
  disabled = false,
}: Props) => {
  if (!activeCategoryName || activeCategory === "all" || disabled) return null;

  return (
    <Breadcrumb className="text-sm md:text-base lg:text-xl">
      <BreadcrumbList>
        {activeCategoryName ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-primary font-medium underline"
              >
                <Link href={`/${activeCategory}`}>{activeCategoryName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-primary font-medium">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {activeSubcategoryName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {activeCategoryName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
