import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters long")
    .max(25, "Password must be less than 25 characters")
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[0-9]/, "Password must contain at least one number")
    // .regex(
    //   /[^A-Za-z0-9]/,
    //   "Password must contain at least one special character",
    // )
    .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(63, "Username must be at most 63 characters.")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username can only contain lowercase letters, numbers, and hyphens. It must start and end with a letter or number.",
    )
    .refine(
      (val) => !val.includes("--"),
      "Username cannot contain consecutive hyphens.",
    )
    .transform((val) => val.toLowerCase()),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
