const SIZE_CLASSES: Record<number, string> = {
  10: 'text-[10px]',
  11: 'text-[11px]',
  12: 'text-xs',
  13: 'text-[13px]',
  14: 'text-sm',
  15: 'text-[15px]',
  16: 'text-base',
};

interface StarRowProps {
  rating: number;
  size?: number;
}

/** Five stars, filled up to the rounded rating. */
export function StarRow({ rating, size = 14 }: StarRowProps) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`${SIZE_CLASSES[size] ?? 'text-sm'} ${
            i <= Math.round(rating) ? 'text-accent-500' : 'text-muted-foreground/25'
          }`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}