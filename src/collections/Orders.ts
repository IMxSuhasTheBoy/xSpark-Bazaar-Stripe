import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "user", "product", "razorpayCheckoutSessionId"],
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
        description:
          "Razorpay checkout session associated with the order. Razorpay payment ID",
      },
    },
  ],
};
