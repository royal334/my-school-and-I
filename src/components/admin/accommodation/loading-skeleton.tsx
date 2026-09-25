export function ListLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-[72px] animate-pulse rounded-[10px] bg-primary-50 dark:bg-white/5" />
      ))}
    </div>
  );
}