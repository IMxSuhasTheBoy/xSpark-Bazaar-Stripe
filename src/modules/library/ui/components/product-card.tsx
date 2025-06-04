import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSlug: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  tenantSlug,
  tenantImageUrl,
  reviewRating,
  reviewCount,
}: ProductCardProps) => {
  return (
    <Link prefetch href={`/library/${id}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-md border bg-white transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative aspect-square">
          <Image
            alt={name}
            src={imageUrl || "/placeholder.png"}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 border-y p-4">
          <h2 className="line-clamp-4 text-lg font-medium">{name}</h2>
          <div className="flex items-center gap-2">
            {tenantImageUrl && (
              <Image
                alt={tenantSlug}
                src={tenantImageUrl}
                width={16}
                height={16}
                className="size-[16px] shrink-0 rounded-full border"
              />
            )}
            <p className="text-sm font-medium underline">{tenantSlug}</p>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="aspect-3/4 w-full animate-pulse rounded-lg bg-neutral-200" />
  );
};

/* The skeleton uses aspect-3/4 while the actual card uses aspect-square, creating a layout shift during loading.
 <div className="flex h-full flex-col overflow-hidden rounded-md border bg-neutral-200">
    <div className="aspect-square animate-pulse bg-neutral-300" />
    <div className="flex flex-1 flex-col gap-3 border-y p-4">
      <div className="h-6 animate-pulse rounded bg-neutral-300" />
      <div className="flex items-center gap-2">
        <div className="size-4 animate-pulse rounded-full bg-neutral-300" />
        <div className="h-4 w-20 animate-pulse rounded bg-neutral-300" />
      </div>
      <div className="flex items-center gap-1">
        <div className="size-3.5 animate-pulse rounded bg-neutral-300" />
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-300" />
      </div>
    </div>
  </div>
*/
