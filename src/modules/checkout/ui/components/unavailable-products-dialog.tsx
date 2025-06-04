import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnavailableProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingIds: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnavailableProductsDialog = ({
  open,
  onOpenChange,
  missingIds,
  onConfirm,
  onCancel,
}: UnavailableProductsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="text-amber-500" />
            Unavailable Products
          </DialogTitle>
          <DialogDescription>
            {missingIds.length}{" "}
            {missingIds.length === 1 ? "product" : "products"} in your cart{" "}
            {missingIds.length === 1 ? "is" : "are"} no longer available. Would
            you like to remove {missingIds.length === 1 ? "it" : "them"} and
            continue with checkout?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button variant="outline" onClick={onCancel}>
            Keep in Cart
          </Button>
          <Button onClick={onConfirm}>Remove and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
