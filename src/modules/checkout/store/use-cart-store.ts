import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TenantCart {
  productIds: string[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>; // object: key & cart
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {},

      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            // spread existing obj into shallow copy.
            ...state.tenantCarts,
            // new property creation, key will be tenantSlug.
            [tenantSlug]: {
              // new array of productIds.
              productIds: [
                // access the productIds array for the given tenant,
                // initialized with the spread operator (...) to keep existing productIds.
                ...(state.tenantCarts[tenantSlug]?.productIds || []),
                productId, // now push the new productId
              ],
            },
          },
        })),

      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              // access the productIds array For the given tenant,
              // return new array by filtering out the productId to remove it from the array.
              productIds:
                state.tenantCarts[tenantSlug]?.productIds.filter(
                  (id) => id !== productId,
                ) || [],
              // if the filtering operation returns an empty array default to an empty array.
            },
          },
        })),

      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              // access the productIds array for the given tenant, reset the productIds array to empty.
              productIds: [],
            },
          },
        })),

      clearAllCarts: () =>
        set({
          // remove all tenant carts by resetting to an empty object.
          tenantCarts: {},
        }),
    }),

    {
      name: "xspark-bazaar-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
