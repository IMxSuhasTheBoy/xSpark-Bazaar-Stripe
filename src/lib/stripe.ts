import Stripe from "stripe";

/**
 * Stripe Client Configuration
 *
 * This module initializes and exports a configured Stripe client instance
 * for secure server-side interactions with the Stripe API.
 *
 * Key Features:
 * - Creates and manages payment sessions
 * - Handles Stripe webhook events
 * - Manages customers and their payment methods
 * - Handles products, prices, and subscriptions
 * - Processes payments and refunds
 *
 * @requires stripe
 * @requires STRIPE_SECRET_KEY - Environment variable for Stripe secret key
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});
