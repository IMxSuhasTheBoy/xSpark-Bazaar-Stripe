import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const tagsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.find({
          collection: "tags",
          page: input.cursor,
          limit: input.limit,
        }); // query db

        return data;
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tags",
          cause: error,
        });
      }
    }),
});
