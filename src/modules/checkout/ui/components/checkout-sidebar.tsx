import { CircleIcon, AlertTriangleIcon } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CheckoutSidebarProps {
  total: number;
  onPurchase: () => void;
  isCanceled?: boolean;
  disabled?: boolean;
  hasMissingProducts?: boolean;
}

export const CheckoutSidebar = ({
  total,
  onPurchase,
  isCanceled,
  disabled,
  hasMissingProducts,
}: CheckoutSidebarProps) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h4 className="text-lg font-medium">Total</h4>
        <p className="text-lg font-medium">{formatCurrency(total)}</p>
      </div>

      <div className="flex items-center justify-center p-4">
        <Button
          variant="elevated"
          onClick={onPurchase}
          disabled={disabled || hasMissingProducts}
          size="lg"
          className="bg-primary w-full text-base text-white hover:bg-amber-400"
        >
          {hasMissingProducts
            ? "Remove Unavailable Items to Continue"
            : isCanceled
              ? "Try Payment Again"
              : "Checkout Now"}
        </Button>
      </div>

      {hasMissingProducts && (
        <div className="flex items-center justify-center border-t p-4">
          <div className="flex w-full items-center rounded border border-amber-400 bg-amber-100 px-4 py-3 font-medium">
            <div className="flex items-center">
              <AlertTriangleIcon className="mr-2 size-6 text-amber-500" />
              <span>Some items in your cart are no longer available</span>
            </div>
          </div>
        </div>
      )}

      {isCanceled && (
        <div className="flex items-center justify-center border-t p-4">
          <div className="flex w-full items-center rounded border border-red-400 bg-red-100 px-4 py-3 font-medium">
            <div className="flex items-center">
              <CircleIcon className="mr-2 size-6 fill-red-500 text-red-100" />
              <span>
                Checkout failed. Previous payment was cancelled please try
                again.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
