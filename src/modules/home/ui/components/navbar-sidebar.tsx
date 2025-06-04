import Link from "next/link";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const HOVER_STYLES = {
  default: "hover:border-primary hover:bg-accent",
  signin: "hover:bg-amber-400",
  signup: "bg-black text-white hover:bg-amber-400 hover:text-black",
};

interface NavbarItem {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  pathname: string;
  onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({
  items,
  open,
  pathname,
  onOpenChange,
}: Props) => {
  const handleLinkClick = () => onOpenChange(false);

  const NavLink = ({
    href,
    isActive,
    className,
    children,
  }: {
    href: string;
    isActive?: boolean;
    className?: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      prefetch
      onClick={handleLinkClick}
      className={cn(
        "flex w-full items-center border-y border-transparent p-4 text-left text-base font-medium",
        className,
        isActive && "bg-black text-white hover:bg-black",
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenChange(false);
        }
      }}
      role="menuitem"
      tabIndex={0}
    >
      {children}
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex h-full flex-col overflow-y-auto pb-2">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={item.href === pathname}
              className={HOVER_STYLES.default}
            >
              {item.children}
            </NavLink>
          ))}

          <div className="border-t">
            <NavLink href="/sign-in" className={HOVER_STYLES.signin}>
              Log in
            </NavLink>
            <NavLink href="/sign-up" className={HOVER_STYLES.signup}>
              Start selling
            </NavLink>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
