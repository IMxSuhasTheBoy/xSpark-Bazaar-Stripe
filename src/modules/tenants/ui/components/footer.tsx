import Link from "next/link";

import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

export const Footer = () => {
  return (
    <footer className="border-t bg-white font-medium">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center gap-2 px-4 py-6 lg:px-12">
        <p>Powered by</p>
        <Link href="/">
          <span className={cn("text-2xl font-semibold", poppins.className)}>
            xSparkBazaar
          </span>
        </Link>
      </div>
    </footer>
  );
};
