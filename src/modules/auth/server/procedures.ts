import { headers as getHeaders, cookies as getCookies } from "next/headers";

import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();

    const session = await ctx.db.auth({
      headers,
    });

    return session;
  }),

  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });
      const existingUser = existingData?.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists.",
        });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
        },
      });

      // attempt to Login user after registration
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login.",
        });
      }

      const cookie = await getCookies();
      cookie.set({
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",

        // TODO: Ensure cross-domain cookie sharing
        // sameSite: "none"
        // domain: ""
      });
    }),

  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to login. Invalid email or password",
      });
    }

    const cookie = await getCookies();
    cookie.set({
      name: AUTH_COOKIE,
      value: data.token,
      httpOnly: true,
      path: "/",

      // TODO: Ensure cross-domain cookie sharing
      // sameSite: "none"
      // domain: ""
    });

    return data;
  }),

  /* 
    Logout procedure: Terminates user session
    - Removes the authentication cookie
    - Effectively ends the user's session
    - No authentication required to perform logout
  */
  logout: baseProcedure.mutation(async ({}) => {
    const cookie = await getCookies();
    cookie.delete({
      name: AUTH_COOKIE,
      path: "/",
    });
  }),
});
