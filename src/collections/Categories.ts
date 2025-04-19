import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  // access: {
  //   create: () => false,
  //   update: () => false,
  //   read: () => true,
  //   delete: () => false,
  // },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};
