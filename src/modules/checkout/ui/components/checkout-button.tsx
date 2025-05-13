import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { cn, generateTenantURL } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  className?: string;
  tenantSlug: string;
  hideIfEmpty?: boolean;
}

export const CheckoutButton = ({
  className,
  tenantSlug,
  hideIfEmpty,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <Button variant="elevated" asChild className={cn("bg-white", className)}>
      <Link href={`${generateTenantURL(tenantSlug)}/checkout`}>
        <ShoppingCartIcon />
        {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
