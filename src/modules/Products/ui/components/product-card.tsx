import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatCurrency, generateTenantURL } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSlug: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  tenantSlug,
  tenantImageUrl,
  reviewRating,
  reviewCount,
  price,
}: ProductCardProps) => {
  const router = useRouter();

  const handleUserClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    router.push(generateTenantURL(tenantSlug));
  };

  return (
    <Link href={`${generateTenantURL(tenantSlug)}/products/${id}`}>
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
          <div className="flex items-center gap-2" onClick={handleUserClick}>
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
              <p className="text-sm font-medium text-gray-500">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="relative w-fit border bg-amber-400 px-2 py-1">
            <p className="text-sm font-medium">{formatCurrency(price)}</p>
          </div>
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
