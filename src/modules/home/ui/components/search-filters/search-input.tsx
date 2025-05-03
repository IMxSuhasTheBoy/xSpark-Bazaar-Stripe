"use client";

import Link from "next/link";
import { useState } from "react";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoriesSidebar } from "./categories-sidebar";
import { useQuery } from "@tanstack/react-query";

interface Props {
  disabled?: boolean;
}

export const SearchInput = ({ disabled }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  return (
    <div className="flex w-full items-center gap-2">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="relative w-full">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
        <Input className="pl-8" placeholder="Search..." disabled={disabled} />
      </div>

      <Button
        variant="elevated"
        aria-label="Open categories sidebar"
        className="flex size-12 shrink-0 lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>

      {session.data?.user && (
        <Button asChild variant="elevated">
          <Link href="/library">
            <BookmarkCheckIcon />
            Library
          </Link>
        </Button>
      )}
    </div>
  );
};
