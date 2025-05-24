/* tRPC server context setup, base router, and base procedure middleware for Payload CMS integration */

import { cache } from "react";
import superjson from "superjson";
import { getPayload } from "payload";

import config from "@payload-config";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";

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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to initialize Payload CMS",
    });
  }
});

/**
 * A TRPC procedure middleware that ensures the user is authenticated.
 *
 * This middleware retrieves headers and validates the user's session
 * using the provided authentication mechanism. If the user is not
 * authenticated, it throws a `TRPCError` with the code "UNAUTHORIZED".
 *
 * Upon successful authentication, it augments the context with the
 * authenticated user's session information and proceeds to the next
 * middleware or resolver.
 *
 * @throws {TRPCError} If the user is not authenticated.
 *
 * @example
 * // Usage in a TRPC router
 * const router = t.router({
 *   secureEndpoint: protectedProcedure.query(() => {
 *     return "This is a secure endpoint";
 *   }),
 * });
 */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const headers = await getHeaders();
  const session = await ctx.db.auth({
    headers,
  });

  if (!session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...session,
        user: session.user,
      },
    },
  });
});
