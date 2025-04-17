import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";

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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex h-full flex-col overflow-y-auto pb-2">
          {items.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              onClick={() => {
                onOpenChange(false);
              }}
              className="flex w-full items-center p-4 text-left text-base font-medium hover:bg-black hover:text-white"
            >
              {item.children}
            </Link>
          ))}

          <div className="border-t">
            <Link
              href="/sign-in"
              onClick={() => {
                onOpenChange(false);
              }}
              className="flex w-full items-center p-4 text-left text-base font-medium hover:bg-amber-400"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => {
                onOpenChange(false);
              }}
              className="flex w-full items-center bg-black p-4 text-left text-base font-medium text-white hover:bg-amber-400 hover:text-black"
            >
              Start selling
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
