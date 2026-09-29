/** Placeholder shown while the detail query resolves. */
export function ListingDetailSkeleton() {
  return (
    <div>
      <div className="h-[280px] animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-4 rounded bg-muted ${i === 0 ? 'w-3/5' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  );
}