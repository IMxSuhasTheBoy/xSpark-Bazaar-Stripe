import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { razorpay } from "@/lib/razorpay";
import { Media, Tenant } from "@/payload-types";

export const checkoutRouter = createTRPCRouter({
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
        /*  {
              docs: [
                {
                  createdAt: '2025-05-21T06:32:22.644Z',
                  updatedAt: '2025-05-21T06:34:01.972Z',
                  tenant: [Object],
                  name: 'imxsuhastheboy1 pro2',
                  description: 'imxsuhastheboy1 pro2',
                  price: 54,
                  category: [Object],
                  image: [Object],
                  cover: [Object],
                  refundPolicy: '1-day',
                  tags: [Array],
                  id: '682d737616bad3a45b0c099e'
                },
                {
                  createdAt: '2025-05-14T07:51:17.524Z',
                  updatedAt: '2025-05-21T06:33:14.719Z',
                  tenant: [Object],
                  name: 'imxsuhastheboy1 pro1',
                  description: 'imxsuhastheboy1 pro1',
                  price: 35,
                  category: [Object],
                  image: [Object],
                  cover: [Object],
                  refundPolicy: '3-day',
                  id: '68244b75573eb4b3f0b8ef0f'
                }
              ],
              totalDocs: 2,
              limit: 10,
              totalPages: 1,
              page: 1,
              pagingCounter: 1,
              hasPrevPage: false,
              hasNextPage: false,
              prevPage: null,
              nextPage: null
            }
        */

        //
        const foundIds = new Set(data.docs.map((doc) => doc.id));
        const missingIds = input.ids.filter((id) => !foundIds.has(id)); // only the IDs that are not present in the foundIds Set.

        if (data.totalDocs !== input.ids.length) {
          console.log(data.totalDocs, input.ids.length);
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
            { id: { in: input.productIds } },
            { "tenant.slug": { equals: input.tenantSlug } },
          ],
        },
      });
      /*
      {
        docs: [
          {
            createdAt: '2025-05-21T06:32:22.644Z',
            updatedAt: '2025-05-21T06:34:01.972Z',
            tenant: [Object],
            name: 'imxsuhastheboy1 pro2',
            description: 'imxsuhastheboy1 pro2',
            price: 54,
            category: [Object],
            image: [Object],
            cover: [Object],
            refundPolicy: '1-day',
            tags: [Array],
            id: '682d737616bad3a45b0c099e'
          },
          {
            createdAt: '2025-05-14T07:51:17.524Z',
            updatedAt: '2025-05-21T06:33:14.719Z',
            tenant: [Object],
            name: 'imxsuhastheboy1 pro1',
            description: 'imxsuhastheboy1 pro1',
            price: 35,
            category: [Object],
            image: [Object],
            cover: [Object],
            refundPolicy: '3-day',
            id: '68244b75573eb4b3f0b8ef0f'
          }
        ],
        totalDocs: 2,
        limit: 10,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      } 
      */

      // not required: const foundIds = new Set(products.docs.map((doc) => doc.id));
      // not required: const missingIds = input.productIds.filter((id) => !foundIds.has(id));
      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "checkoutRouter: purchase: Some products not found",
        });
      }

      // find that tenant who has listed the products
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        depth: 1,
        where: {
          slug: { equals: input.tenantSlug },
        },
        limit: 1,
        pagination: false,
      });

      const tenant = tenantsData.docs[0];

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "checkoutRouter: purchase: Tenant not found",
        });
      }

      // TODO: verify for throwing error: razorpay details not submitted

      // Calculate total amount (in paise)
      const totalAmount =
        products.docs.reduce((acc, product) => acc + product.price, 0) * 100;

      /*
        if (totalAmount <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid order amount",
          });
        }
      */

      // Create Razorpay order // 2:09 note: on stripe flow creates lineItems (individual order for each product)
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount,
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          // razorpayAccountId: tenant.razorpayAccountId,
          tenantSlug: input.tenantSlug,
          userId: ctx.session.user.id,
          productIds: input.productIds.join(","),
        },
        // The notes field can be used to pass productIds, tenantSlug, userId, etc. from order creation
      });
      /*
      {
        amount: 8900,
        amount_due: 8900,
        amount_paid: 0,
        attempts: 0,
        created_at: 1747891442,
        currency: 'INR',
        entity: 'order',
        id: 'order_QXrGFuJMPVl1uz',
        notes: {
          productIds: '682d737616bad3a45b0c099e,68244b75573eb4b3f0b8ef0f',        
          tenantSlug: 'imxsuhastheboy1',
          userId: '681cae95158b1ae56ec2df61'
        },
        offer_id: null,
        receipt: 'order_1747891443599',
        status: 'created'
      }
      */
      console.log("checkoutRouter: purchase: razorpayOrder:", razorpayOrder);

      if (!razorpayOrder || !razorpayOrder.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Razorpay order",
        });
      }

      // Return order details for frontend Razorpay checkout
      return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        tenantSlug: input.tenantSlug,
        userEmail: ctx.session.user.email,
        userName: ctx.session.user.username || ctx.session.user.email,

        // You may add more fields as needed
      };
    }),
});

/*  moved to api/razorpay/webhooks/route.ts
 verifyPayment: protectedProcedure
    .input(
      z.object({
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
        tenantSlug: z.string(),
        productIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const crypto = await import("crypto");
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(input.razorpayOrderId + "|" + input.razorpayPaymentId)
        .digest("hex");

      if (generatedSignature !== input.razorpaySignature) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment signature",
        });
      }

      // Fetch products and tenant as before
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            { id: { in: input.productIds } },
            { "tenant.slug": { equals: input.tenantSlug } },
          ],
        },
      });

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }
      console.log("checkoutRouter: verifyPayment: products:", products);
      
      // {
      //   docs: [
      //     {
      //       createdAt: '2025-05-14T07:39:57.894Z',
      //       updatedAt: '2025-05-14T07:41:20.590Z',
      //       tenant: [Object],
      //       name: 'imxsuhastheboy pro3',
      //       description: 'imxsuhastheboy pro3',
      //       price: 90,
      //       category: [Object],
      //       tags: [],
      //       image: [Object],
      //       cover: [Object],
      //       refundPolicy: 'no-refunds',
      //       id: '682448cd573eb4b3f0b8eaa0'
      //     },
      //     {
      //       createdAt: '2025-05-13T11:00:52.323Z',
      //       updatedAt: '2025-05-13T11:00:52.323Z',
      //       tenant: [Object],
      //       name: 'imxsuhastheboy pro1',
      //       description: 'imxsuhastheboy pro1',
      //       price: 50,
      //       category: [Object],
      //       tags: [Array],
      //       image: [Object],
      //       cover: [Object],
      //       refundPolicy: '14-day',
      //       id: '68232664c43f70e02b820642'
      //     }
      //   ],
      //   totalDocs: 2,
      //   limit: 10,
      //   totalPages: 1,
      //   page: 1,
      //   pagingCounter: 1,
      //   hasPrevPage: false,
      //   hasNextPage: false,
      //   prevPage: null,
      //   nextPage: null
      // }
      
      // Create an order record for each product (customize as needed)
      const userId = ctx.session.user.id;
      for (const product of products.docs) {
        await ctx.db.create({
          collection: "orders",
          data: {
            name: product.name,
            user: userId,
            product: product.id,
            paymentId: input.razorpayPaymentId,
          },
        });
      }
      
      return { success: true };
    }),
    
    */
