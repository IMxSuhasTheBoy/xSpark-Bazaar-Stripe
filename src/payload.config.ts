import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";

// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";

import { isSuperAdmin } from "./lib/access";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Products } from "./collections/Products";
import { Tags } from "./collections/Tags";
import { Tenants } from "./collections/Tenants";
import { Config } from "./payload-types";
import { Orders } from "./collections/Orders";
import { Reviews } from "./collections/Reviews";

function validateEnv() {
  const required = ["DATABASE_URI", "PAYLOAD_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missing.join(", ")}`,
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

validateEnv();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ["@/components/stripe-verify#StripeVerify"],
    },
  },
  // Define and configure your collections in this array
  collections: [
    Users,
    Media,
    Categories,
    Products,
    Tags,
    Tenants,
    Orders,
    Reviews,
  ],
  editor: lexicalEditor(),
  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres, SQL Server, etc.
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
    // Add connection options for better error handling
    connectOptions: {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin<Config>({
      collections: {
        products: {},
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    // storage-adapter-placeholder
  ],
});
