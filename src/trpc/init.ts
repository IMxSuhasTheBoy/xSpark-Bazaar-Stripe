/* tRPC server context setup, base router, and base procedure middleware for Payload CMS integration */

import { cache } from "react";
import superjson from "superjson";
import { getPayload } from "payload";

import { initTRPC } from "@trpc/server";
import config from "@payload-config";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };

  /* // TODO: Replace with actual authentication logic
    const session = await getSession(); // Example placeholder for your auth solution
    return { userId: session?.user?.id || null };
   */
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
  try {
    const payload = await getPayload({ config });

    return next({
      ctx: { db: payload },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Failed to initialize Payload CMS:", error);

    // Re-throw with a clearer message for API consumers
    throw new Error("Database connection failed");
  }
});
