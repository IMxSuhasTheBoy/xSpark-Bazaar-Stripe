import { z } from "zod";
import type Stripe from "stripe";

import { TRPCError } from "@trpc/server";

import { stripe } from "@/lib/stripe";
import { Media, Tenant } from "@/payload-types";
import { PLATFORM_FEE_PERCENTAGE } from "@/constants";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

import { CheckoutMetadata, ProductMetadata } from "../types";

export const checkoutRouter = createTRPCRouter({
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.findByID({
      collection: "users",
      id: ctx.session.user.id,
      depth: 0, // user.tenants[0].tenant will be a string (tenantId)
    }); // query db

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const tenantId = user.tenants?.[0]?.tenant as string; // This is an id beacause of depth: 0
    const tenant = await ctx.db.findByID({
      collection: "tenants",
      id: tenantId,
    }); // query db

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: tenant.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
      type: "account_onboarding",
    });

    if (!accountLink.url) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to create verification link",
      });
    }

    return { url: accountLink.url };
  }),

  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.find({
          collection: "products",
          depth: 2, // Control relationship depth for populating "category", "image", "tenant" & "tenant.image".
          where: {
            id: {
              in: input.ids,
            },
          },
        }); // query db

        //
        const foundIds = new Set(data.docs.map((doc) => doc.id));
        const missingIds = input.ids.filter((id) => !foundIds.has(id)); // only the IDs that are not present in the foundIds Set.

        if (data.totalDocs !== input.ids.length) {
          console.warn(
            `Product count mismatch: found ${data.totalDocs} products, expected ${input.ids.length}`,
          );
        }
        //

        // typeof image is assigned as Media type individually
        return {
          ...data,
          missingIds,
          totalPrice: data.docs.reduce((acc, doc) => acc + doc.price, 0),
          docs: data.docs.map((doc) => ({
            ...doc,
            image: doc.image as Media | null,
            cover: doc.cover as Media | null,
            tenant: doc.tenant as Tenant & { image: Media | null },
          })),
        };
      } catch (error) {
        console.error("Error fetching products: checkoutRouter", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
          cause: error,
        });
      }
    }),

  /**
   * Initiates a secure checkout process for products.
   *
   * This procedure performs two critical validations at the ORM level:
   * 1. Verifies that all requested products exist in the database
   * 2. Ensures products belong to the specified tenant's slug
   *
   * This double validation safeguards against:
   * - Attempts to purchase non-existent products
   * - Cross-tenant product access
   * - Data integrity issues during checkout
   *
   * @input {object} input
   * @input {string[]} input.productIds - Array of product IDs to purchase
   * @input {string} input.tenantSlug - Unique identifier of the tenant
   *
   * @throws {TRPCError} When products are not found or tenant validation fails
   */
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch products and tenant: Validate
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: { in: input.productIds },
            },
            {
              "tenant.slug": { equals: input.tenantSlug },
            },
          ],
        },
      }); // query db

      // TODO: if required check for ensuring the user cannot purchase already owned product again.

      // not required: const foundIds = new Set(products.docs.map((doc) => doc.id));
      // not required: const missingIds = input.productIds.filter((id) => !foundIds.has(id));
      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "checkoutRouter: purchase: Some products not found",
        });
      }

      // Retrieve tenant details associated with the listed products
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        depth: 1,
        where: {
          slug: { equals: input.tenantSlug },
        },
        limit: 1,
        pagination: false,
      }); // query db

      const tenant = tenantsData.docs[0];

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "checkoutRouter: purchase: Tenant not found",
        });
      }

      if (!tenant.stripeDetailsSubmitted) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant is not allowed to sell products.",
        });
      }

      /* This code prepares list of products (called "line items") to send to Stripe when creating a checkout session.
       Each "line item" represents a product in the cart.

       How does it fit in the checkout flow?
        - User clicks "Checkout".
        - Backend runs this code to prepare the list of products for Stripe.
        - Stripe checkout session is created with these line items.
        - User is redirected to Stripe to pay for these items.
        - After payment, Stripe notifies backend (via webhook).
        - Backend receives the metadata to create orders and associate them with the correct user, product, and tenant.
       */
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1,
          price_data: {
            currency: "INR",
            unit_amount: product.price * 100, // miliunits
            product_data: {
              name: product.name,
              ...(typeof product.description === "string"
                ? { description: product.description }
                : {}),
              metadata: {
                stripeAccountId: tenant.stripeAccountId,
                id: product.id,
                name: product.name,
                price: product.price,
              } as ProductMetadata,
            },
          },
        }));

      const totalAmount = products.docs.reduce(
        (acc, product) => acc + product.price * 100,
        0,
      );

      const platformFeeAmount = Math.round(
        totalAmount * (PLATFORM_FEE_PERCENTAGE / 100),
      );

      /* Create Stripe checkout session, which is a secure Stripe-hosted payment page */
      const checkout = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session.user.email,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?cancel=true`,
          mode: "payment",
          line_items: lineItems,
          invoice_creation: { enabled: true },
          metadata: {
            userId: ctx.session.user.id,
          } as CheckoutMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeeAmount,
          },
        },
        {
          stripeAccount: tenant.stripeAccountId,
        },
      );

      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe checkout session",
        });
      }

      /* Send the Stripe Checkout URL back to the frontend.
        The frontend will redirect the user to this URL so they can pay.
        After payment, Stripe can notify backend (via webhook) so backend can create the orders.
      */
      return {
        checkoutUrl: checkout.url,
      };
    }),
});
