import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "slug",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Store Name",
      required: true,
      admin: {
        description:
          "This is the name of the store you are creating. (e.g. John Doe's Store)",
      },
    },
    {
      name: "slug",
      type: "text",
      label: "Store Slug",
      index: true,
      unique: true,
      required: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description:
          "This is the subdomain for the store you are creating. (e.g. [slug].xsparkbazaar.com)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "This is the image for the store you are creating.",
      },
    },
    {
      name: "razorpayAccountId",
      type: "text",
      required: false,
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        readOnly: true,
        description: "Razorpay account ID associated with your store.",
      },
    },
    {
      name: "razorpayDetailsSubmitted",
      type: "checkbox",
      admin: {
        description:
          "You cannot create products until you have submitted your Razorpay details.",
      },
    },
  ],
};
