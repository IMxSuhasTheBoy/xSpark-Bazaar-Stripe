import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";

const HOVER_STYLES = {
  default: "hover:bg-black hover:text-white",
  signin: "hover:bg-amber-400",
  signup: "bg-black text-white hover:bg-amber-400 hover:text-black",
};

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const handleLinkClick = () => onOpenChange(false);

  const NavLink = ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      onClick={handleLinkClick}
      className={`flex w-full items-center p-4 text-left text-base font-medium ${className}`}
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
