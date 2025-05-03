export const SearchFiltersErrorFallback = () => {
  return (
    <div className="flex h-11 items-center justify-center rounded-md bg-red-50 px-4">
      <p className="text-sm text-red-600">
        Failed to load categories. Please try again later.
      </p>
    </div>
  );
};
