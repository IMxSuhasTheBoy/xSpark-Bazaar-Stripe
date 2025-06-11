import type Stripe from "stripe";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

import config from "@payload-config";

import { stripe } from "@/lib/stripe";
import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { message: "Webhook endpoint is not properly configured" },
      { status: 500 },
    );
  }
  let event: Stripe.Event;

  try {
    // reads the raw body of the request and the special stripe-signature header, uses secret key to verify
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      webhookSecret,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (!(error instanceof Error)) {
      console.log(error);
    }

    console.log(`🚨 Webhook error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook error: ${errorMessage}` },
      { status: 400 },
    );
  }
  console.log("✔ Success: ", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            },
            {
              stripeAccount: event.account,
            },
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("Line items not found");
          }

          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];

          // Create an order for each product
          for (const item of lineItems) {
            await payload.create({
              collection: "orders",
              // know if some products were bought together using the same checkout session data
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: item.price.product.metadata.id, // TODO: if requred Add validation for product metadata and error handling (pr #25)
                name: item.price.product.name,
              },
            });
          }
          break;
        }

        case "account.updated": {
          data = event.data.object as Stripe.Account;

          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: { equals: data.id },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });
          break;
        }

        default:
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error);
      return NextResponse.json(
        { message: "Webhook handler failed." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
