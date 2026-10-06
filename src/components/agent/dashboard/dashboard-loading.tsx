import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[100px] animate-pulse bg-primary-600/70 dark:bg-primary-800" aria-hidden />

      <div className="flex flex-col gap-4 p-4" aria-hidden>
        <div className="grid grid-cols-3 gap-2.5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      <span className="sr-only" role="status">
        Loading your agent dashboard
      </span>
    </div>
  );
}
