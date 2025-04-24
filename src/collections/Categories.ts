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
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "color",
      type: "text",
      validate: (value: string | undefined | null) => {
        if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
          return "Color must be a valid hex code (e.g., #FFF or #FFFFFF)";
        }
        return true;
      },
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "subcategories",
      type: "join",
      collection: "categories",
      on: "parent",
      hasMany: true,
    },
  ],
};
