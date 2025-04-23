import { Categories } from "./categories";
import { SearchInput } from "./search-input";

interface Props {
  data: any;
}
export const SearchFilters = ({ data }: Props) => {
  return (
    <div className="flex w-full flex-col gap-4 border-b px-4 py-8 lg:px-12">
      <SearchInput />
      <Categories data={data} />
      {/* testing: {JSON.stringify(data, null, 2)} */}
    </div>
  );
};
