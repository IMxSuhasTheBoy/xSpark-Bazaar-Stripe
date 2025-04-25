import { CustomCategory } from "../types";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";

interface Props {
  data: CustomCategory[];
}
export const SearchFilters = ({ data }: Props) => {
  return (
    <div className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12">
      <SearchInput data={data} />
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
    </div>
  );
};
