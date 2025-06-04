"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon } from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { generateTenantURL } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
// import { UnavailableProductsDialog } from "../components/unavailable-products-dialog";

interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();
  const { productIds, removeProduct, clearCart } = useCart(tenantSlug);
  // const [dialogOpen, setDialogOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
    }),
  );

  const hasMissingProducts = (data?.missingIds ?? []).length > 0; // TODO: invalid products found: when checkout page loads for the first time immediately perform missing ids clearing on cart & dont allow to checkout until dialog to confirm checkout with the remaining ids from localstorage cart is confirmed

  // useEffect(() => {
  //   if (hasMissingProducts) {
  //     setDialogOpen(true);
  //   }
  // }, [hasMissingProducts]);

  // const handleRemoveUnavailableProducts = () => {
  //   data?.missingIds?.forEach((id) => removeProduct(id));
  //   setDialogOpen(false);
  // };

  // Razorpay purchase mutation
  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        // Link was succesfully created
        window.location.href = data.checkoutUrl;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          // TODO: modify when subdomain enables
          router.push("/sign-in");
        }

        toast.error(error.message);
      },
    }),
  );

  // Handle payment cancellation
  useEffect(() => {
    if (!states.cancel) return;
    toast.info("Payment was cancelled. You can try again.");
  }, [states.cancel]);

  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false });
      clearCart(); // Clear cart after payment success
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push("/library");
    }
  }, [
    states.success,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  if (isLoading) {
    return (
      <div className="px-4 pt-4 lg:px-12 lg:pt-16">
        <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded-lg border border-dashed border-black bg-white p-8">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="px-4 pt-4 lg:px-12 lg:pt-16">
        <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded-lg border border-dashed border-black bg-white p-8">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <UnavailableProductsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        missingIds={data?.missingIds || []}
        onConfirm={handleRemoveUnavailableProducts}
        onCancel={() => setDialogOpen(false)}
      /> */}
      <div className="px-4 pt-4 lg:px-12 lg:pt-16">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-md border bg-white">
              {data?.docs.map((product, index) => (
                <CheckoutItem
                  key={product.id}
                  isLast={index === data.docs.length - 1}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image?.url}
                  tenantName={product.tenant.name}
                  productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                  tenantUrl={generateTenantURL(product.tenant.slug)}
                  onRemove={() => removeProduct(product.id)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <CheckoutSidebar
              total={data?.totalPrice || 0}
              onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
              isCanceled={states.cancel}
              disabled={purchase.isPending || hasMissingProducts}
              hasMissingProducts={hasMissingProducts}
            />
            {purchase.isPending && (
              <div className="mt-2 flex justify-center">
                <LoaderIcon className="text-muted-foreground animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">
                  Processing payment...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
