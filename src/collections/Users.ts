import type { CollectionConfig } from "payload";
import { tenantsArrayField } from "@payloadcms/plugin-multi-tenant/fields";

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: "tenants",
  tenantsCollectionSlug: "tenants",
  tenantsArrayTenantFieldName: "tenant",
  arrayFieldAccess: {
    create: () => true,
    read: () => true,
    update: () => true,
  },
  tenantFieldAccess: {
    create: () => true,
    read: () => true,
    update: () => true,
  },
});

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["user", "super-admin"],
      admin: {
        position: "sidebar",
      },
    },
    {
      ...defaultTenantArrayField,
      admin: {
        ...(defaultTenantArrayField?.admin || {}),
        position: "sidebar",
      },
    },
  ],
};
