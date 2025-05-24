import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "user", "product", "paymentId"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false,
      admin: {
        description: "Product associated with this order",
      },
    },
    {
      name: "razorpayCheckoutSessionId",
      type: "text",
      required: true,
      admin: {
        description: "Razorpay payment ID",
      },
    },
  ],
};
