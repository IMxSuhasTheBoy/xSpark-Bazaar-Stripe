"use client";

import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { registerSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignUpView = () => {
  const router = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const register = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        toast.success("Account created successfully!");
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong, please try again.");
      },
    }),
  );

  const form = useForm<z.infer<typeof registerSchema>>({
    mode: "all",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const passwordsMatch = password === confirmPassword;

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate({
      email: values.email,
      password: values.password,
      username: values.username,
    });
  };

  const username = form.watch("username");
  const usernameErrors = form.formState.errors.username;

  const showPreview = username && !usernameErrors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-9">
      <div
        className="hidden h-screen w-full lg:col-span-1 lg:block"
        // style={{ backgroundColor: "#A4A4F4" }}
        style={{
          backgroundImage: "url('/auth-bg.png')",
          backgroundPosition: "20% 0%",
        }}
      />

      <div className="h-screen w-full overflow-y-auto bg-[#F4F4F4] lg:col-span-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="mb-8 flex items-center justify-between">
              <Link href="/">
                <span
                  className={cn("text-2xl font-semibold", poppins.className)}
                >
                  xSparkBazaar
                </span>
              </Link>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="border-none text-base underline"
              >
                <Link href="/sign-in" prefetch>
                  Sign in
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-medium">Welcome to xSparkBazaar</h1>
            <p className="text-muted-foreground text-lg">
              Join India&apos;s fastest growing multi-tenant marketplace. Create
              your account to start selling or shopping across multiple
              categories.
            </p>
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription
                    className={cn("hidden", showPreview && "block")}
                  >
                    Your store will be available at&nbsp;
                    <span>{username}</span>.shop.com
                    {/* // TODO: methods for generating preview url */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  {passwordsMatch && confirmPassword && (
                    <p className="mt-1 text-sm text-green-600">
                      ✔
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={register.isPending || !passwordsMatch}
              type="submit"
              size="lg"
              variant="elevated"
              className="hover:text-primary bg-black text-white hover:bg-amber-400"
            >
              {register.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>
      </div>
      <div
        className="h-screen w-full lg:col-span-2 lg:block"
        style={{ backgroundColor: "#FBBF24" }}
        // style={{ backgroundImage : "url('/auth-bg.png')",
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center'
        //  }}
      />
    </div>
  );
};
