import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
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
        description: "This is the image for the store you are creating.)",
      },
    },
    {
      name: "stripeAccountId",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox",
      admin: {
        readOnly: true,
        description:
          "You cannot create products until you have submitted your Stripe details.",
      },
    },
  ],
};
