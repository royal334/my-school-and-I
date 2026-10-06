export function CommissionsLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[130px] animate-pulse rounded-xl bg-primary-50 dark:bg-white/5"
        />
      ))}
    </div>
  );
}
