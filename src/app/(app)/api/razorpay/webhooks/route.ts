// import Razorpay from "razorpay";
import crypto from "crypto";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

import config from "@/payload.config";

export async function POST(req: Request) {
  // Razorpay sends the signature in this header
  let body;
  try {
    // const eventid = req.headers.get("x-razorpay-event-id") as string;
    const signature = req.headers.get("x-razorpay-signature") as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    body = await req.text();

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 },
      );
    }
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

  let event;
  try {
    event = JSON.parse(body);
    console.log("Razorpay webhook event:", event);
  } catch (error) {
    console.error("Failed to parse webhook body:", error);
    return NextResponse.json(
      { message: "Invalid webhook payload" },
      { status: 400 },
    );
  }

  /* implement if needed
  const permittedEvents: string[] = ["payment.captured"];
  
  if (permittedEvents.includes(event.event)) {
  }
  */
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const notes = payment.notes || {};
    const productIds = notes.productIds ? notes.productIds.split(",") : [];
    const tenantSlug = notes.tenantSlug;
    const userId = notes.userId;

    if (!userId || !productIds.length) {
      throw new Error("Invalid webhook payload");
    }

    const payload = await getPayload({ config });

    // Validate user exists
    const user = await payload.findByID({
      collection: "users",
      id: userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate products exist and belong to tenant
    const products = await payload.find({
      collection: "products",
      where: {
        and: [
          { id: { in: productIds } },
          { "tenant.slug": { equals: tenantSlug } },
        ],
      },
    });

    console.log("webhook products:", products);

    if (products.totalDocs !== productIds.length) {
      throw new Error("Some products not found");
    }

    // Create order documents
    try {
      for (const product of products.docs) {
        await payload.create({
          collection: "orders",
          data: {
            razorpayCheckoutSessionId: payment.id,
            name: product.name,
            user: userId,
            product: product.id,
          },
        });
      }

      return NextResponse.json(
        { message: "Orders created successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error creating orders:", error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}

// else {
//   console.log(`Ignoring event: ${event.event}`);
//   return NextResponse.json(
//     { message: "Event not permitted" },
//     { status: 400 },
//   );
// }

/*

// types/razorpay.ts
interface RazorpayPaymentEntity {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: {
    productIds?: string;
    tenantSlug?: string;
    userId?: string;
    [key: string]: string | undefined;
  };
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}

interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: RazorpayPaymentEntity;
    };
  };
  created_at: number;
}

const event: RazorpayWebhookEvent = JSON.parse(body);
*/
