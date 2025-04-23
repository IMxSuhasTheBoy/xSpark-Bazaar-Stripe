interface Props {
  disabled?: boolean;
}

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import React from "react";

export const SearchInput = ({ disabled }: Props) => {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative w-full">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
        <Input className="pl-8" placeholder="xSearch..." disabled={disabled} />
      </div>
      {/* TODO: add  categories view all  btn*/}
      {/* TODO: add  library btn */}
    </div>
  );
};
