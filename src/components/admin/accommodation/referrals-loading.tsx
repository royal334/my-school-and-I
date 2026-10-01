export function ReferralsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-[136px] animate-pulse rounded-xl bg-primary-50 dark:bg-white/5" />
      ))}
    </div>
  );
}
