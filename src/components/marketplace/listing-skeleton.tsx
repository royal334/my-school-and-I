/** Card-shaped placeholders used as the Suspense fallback for the feed. */
export function ListingSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="h-[150px] animate-pulse bg-muted" />
          <div className="p-3">
            <div className="mb-1.5 h-2.5 w-3/5 rounded bg-muted" />
            <div className="mb-1.5 h-3.5 w-[90%] rounded bg-muted" />
            <div className="h-4 w-2/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}