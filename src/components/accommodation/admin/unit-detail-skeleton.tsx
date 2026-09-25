export function UnitDetailSkeleton() {
  return (
    <div className="p-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="mb-2.5 h-[72px] animate-pulse rounded-[10px] bg-primary-50 dark:bg-white/5"
        />
      ))}
    </div>
  );
}