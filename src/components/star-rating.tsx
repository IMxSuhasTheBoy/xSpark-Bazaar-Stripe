import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_RATING = 5;
const MIN_RATING = 0;

interface StarRatingProps {
  rating: number;
  classname?: string;
  iconClassName?: string;
  text?: string;
}

export const StarRating = ({
  rating,
  classname,
  iconClassName,
  text,
}: StarRatingProps) => {
  const safeRating = Math.max(MIN_RATING, Math.min(rating, MAX_RATING));

  return (
    <div
      className={cn("flex items-center gap-x-1", classname)}
      role="img"
      aria-label={`Rating: ${safeRating} out of ${MAX_RATING} stars${text ? `, ${text}` : ""}`}
    >
      {Array.from({ length: MAX_RATING }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "size-4",
            index < safeRating ? "fill-black" : "",
            iconClassName,
          )}
        />
      ))}
      {text && (
        <span className="text-muted-foreground text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  );
};
