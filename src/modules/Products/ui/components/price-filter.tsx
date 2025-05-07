import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export const formatAsCurrency = (value: string) => {
  // replace non-numeric characters with empty string
  const numericValue = value.replace(/[^0-9.]/g, "");

  // could be improved to ensure only one decimal point is retained. Currently, if a user enters multiple decimal points, it will keep only the first part with decimals. ( pr #13 )
  const parts = numericValue.split(".");
  const formattedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formattedValue) return "";

  const numberValue = parseFloat(formattedValue);
  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) => {
  // Extract numeric values from input and call the appropriate handler
  const handlePriceChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChangeHandler: (value: string) => void,
  ) => {
    // getting the raw input value and extract only numeric values
    const numericValue = event.target.value.replace(/[^0-9.]/g, "");
    onChangeHandler(numericValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="text-base font-medium">Minimum price</Label>
        <Input
          type="text"
          placeholder="₹0"
          value={minPrice ? formatAsCurrency(minPrice) : ""}
          onChange={(event) => handlePriceChange(event, onMinPriceChange)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-base font-medium">Maximum price</Label>
        <Input
          type="text"
          placeholder="∞"
          value={maxPrice ? formatAsCurrency(maxPrice) : ""}
          onChange={(event) => handlePriceChange(event, onMaxPriceChange)}
        />
      </div>
    </div>
  );
};
