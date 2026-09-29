interface StarRatingProps {
  rating: number | null;
  count: number;
}

/** Compact "★ 4.5 (12)" read-only rating. Renders nothing when unrated. */
export function StarRating({ rating, count }: StarRatingProps) {
  if (!rating || count === 0) return null;

  return (
    <span className="text-[11px] text-accent-600 dark:text-accent-400">
      ★ {rating.toFixed(1)} ({count})
    </span>
  );
}