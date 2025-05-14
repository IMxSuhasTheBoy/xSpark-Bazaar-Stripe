import Link from "next/link";
import Image from "next/image";

import { cn, formatCurrency } from "@/lib/utils";

interface CheckoutItemProps {
  name: string;
  price: number;
  isLast?: boolean;
  tenantUrl: string;
  tenantName: string;
  productUrl: string;
  imageUrl?: string | null;
  onRemove: () => void;
}

export const CheckoutItem = ({
  name,
  price,
  isLast,
  tenantUrl,
  tenantName,
  productUrl,
  imageUrl,
  onRemove,
}: CheckoutItemProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[8.5rem_1fr_auto] gap-4 border-b pr-4",
        isLast && "border-b-0",
      )}
    >
      <div className="overflow-hidden border-r">
        <div className="relative aspect-square h-full">
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <div>
          <Link href={productUrl}>
            <h4 className="font-bold underline">{name}</h4>
          </Link>
          <Link href={tenantUrl}>
            <p className="font-medium underline">{tenantName}</p>
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <p className="font-medium">{formatCurrency(price)}</p>
        <button
          className="cursor-pointer font-medium underline"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
