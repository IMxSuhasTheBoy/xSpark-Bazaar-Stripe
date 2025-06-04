"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { NavbarSidebar } from "./navbar-sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
}

const NavbarItem = ({ href, isActive, children }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "hover:border-primary rounded-full border-transparent bg-transparent px-3.5 text-lg hover:bg-transparent",
        isActive && "bg-black text-white hover:bg-black hover:text-white",
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  {
    href: "/",
    children: "Home",
  },
  {
    href: "/about",
    children: "About",
  },
  {
    href: "/features",
    children: "Features",
  },
  {
    href: "/pricing",
    children: "Pricing",
  },
  {
    href: "/contact",
    children: "Contact",
  },
];

const buttonStyles = {
  signin:
    "h-full rounded-none border-y-0 border-r-0 bg-white px-12 text-lg transition-colors hover:bg-amber-400",
  signup:
    "h-full rounded-none border-y-0 border-r-0 bg-black px-12 text-lg text-white transition-colors hover:bg-amber-400 hover:text-black",
};

export const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  return (
    <nav className="flex h-20 justify-between border-b bg-white font-medium">
      <Link href="/" className="flex items-center pl-6">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          .............
        </span>
      </Link>

      <NavbarSidebar
        items={navbarItems}
        pathname={pathname}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      <div className="hidden items-center gap-4 lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={item.href === pathname}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>

      {session.data?.user ? (
        <div className="hidden lg:flex">
          <Button asChild className={cn(buttonStyles.signup)}>
            <Link href="/admin">Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex">
          <Button
            asChild
            variant="secondary"
            className={cn(buttonStyles.signin)}
          >
            <Link prefetch href="/sign-in">
              Log in
            </Link>
          </Button>

          <Button asChild className={cn(buttonStyles.signup)}>
            <Link prefetch href="/sign-up">
              Start selling
            </Link>
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center lg:hidden">
        <Button
          variant="ghost"
          size="lg"
          className="border-transparent bg-white"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isSidebarOpen}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
