"use client";

import { toast } from "sonner";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

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

  const { data, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
    }),
  );

  console.log("checkout-view: data: ", { data });
  /* example: requested with 2 ids of cart, recieved only 1 product for it & missingIds array
  {
    "data": {
      "docs": [
        {
          "createdAt": "2025-05-14T07:51:17.524Z",
          "updatedAt": "2025-05-21T06:33:14.719Z",
          "tenant": {
                    "createdAt": "2025-05-08T13:22:16.416Z",
                    "updatedAt": "2025-05-08T13:22:16.416Z",
                    "name": "imxsuhastheboy1",
                    "slug": "imxsuhastheboy1",
                    "stripeAccountId": "test",
                    "id": "681cb008158b1ae56ec2e0b2"
                },
                "name": "imxsuhastheboy1 pro1",
                "description": "imxsuhastheboy1 pro1",
                "price": 35,
                "category": {
                    "createdAt": "2025-05-08T13:14:16.670Z",
                    "updatedAt": "2025-05-08T13:14:16.670Z",
                    "name": "Fitness & Health",
                    "slug": "fitness-health",
                    "color": "#FF9AA2",
                    "parent": null,
                    "subcategories": {
                        "docs": [
                            "681cae29986cef368e225444",
                            "681cae29986cef368e225441",
                            "681cae29986cef368e22543e",
                            "681cae28986cef368e22543b"
                        ],
                        "hasNextPage": false
                    },
                    "id": "681cae28986cef368e225439"
                },
                "image": {
                    "createdAt": "2025-05-14T07:50:45.271Z",
                    "updatedAt": "2025-05-21T06:33:02.352Z",
                    "alt": "imxsuhastheboy1",
                    "filename": "1-1.png",
                    "mimeType": "image/png",
                    "filesize": 40424,
                    "width": 1025,
                    "height": 1025,
                    "focalX": 50,
                    "focalY": 50,
                    "thumbnailURL": null,
                    "url": "/api/media/file/1-1.png",
                    "id": "68244b55573eb4b3f0b8eedb"
                },
                "cover": {
                    "createdAt": "2025-05-14T07:51:11.120Z",
                    "updatedAt": "2025-05-14T07:51:11.120Z",
                    "alt": "imxsuhastheboy1",
                    "filename": "Texture9-1.jpg",
                    "mimeType": "image/jpeg",
                    "filesize": 671005,
                    "width": 1920,
                    "height": 1080,
                    "focalX": 50,
                    "focalY": 50,
                    "id": "68244b6f573eb4b3f0b8eef8",
                    "url": "/api/media/file/Texture9-1.jpg",
                    "thumbnailURL": null
                },
                "refundPolicy": "3-day",
                "id": "68244b75573eb4b3f0b8ef0f"
            }
        ],
        "totalDocs": 1,
        "limit": 10,
        "totalPages": 1,
        "page": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null,
        "totalPrice": 35,
        "missingIds": [
            "682d737616bad3a45b0c099e"
        ]
    }
  }
  */

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
      onSuccess: async (data) => {
        // TODO: figureout if this options obj can be formed in procedures & just recive it here
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "xSparkBazaar",
          order_id: data.razorpayOrderId,
          prefill: {
            email: data.userEmail,
            name: data.userName,
          },

          handler: function () {
            setStates({ success: true, cancel: false });
            toast.success(
              "Payment processing. You will be notified once complete.",
            );
          },
          modal: {
            ondismiss: function () {
              setStates({ success: false, cancel: true });
              toast.info("Payment popup closed. No payment was made.");
            },
            escape: false,
            confirm_close: true,
          },
          theme: { color: "#FBBF24" },
        };
        // @ts-expect-error: global window.Razorpay object injected by the Razorpay JS SDK.
        const rzp = new window.Razorpay(options);
        rzp.open();
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          // TODO: modify when subdomains enables
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

  // Add this success effect handler after the cancel effect
  useEffect(() => {
    if (states.success) {
      // setStates  ceckk if requied 
      clearCart(); // Clear cart after successful payment
      router.push("/products");
      toast.success("Payment successful!");
    }
  }, [states.success, clearCart, router]);

  const handlePurchase = () => {
    purchase.mutate({ tenantSlug, productIds });
  };

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
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onError={() =>
          toast.error("Failed to load Razorpay SDK. Please refresh the page.")
        }
      />

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
              onPurchase={handlePurchase}
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

