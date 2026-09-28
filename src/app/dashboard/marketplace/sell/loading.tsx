export default function SellLoading() {
  return (
    <div>
      <div className="h-[88px] w-full animate-pulse rounded-xl bg-primary-200/60 dark:bg-primary-800/50" />
      <div className="h-[41px] w-full animate-pulse border-b border-border bg-muted" />
      <div className="flex flex-col gap-4.5 p-4">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-30 animate-pulse rounded-lg bg-muted" />
        <div className="h-25 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}