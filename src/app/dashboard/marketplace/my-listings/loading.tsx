export default function MyListingsLoading() {
  return (
    <div>
      <div className="h-14 w-full rounded-xl bg-primary-200/60 dark:bg-primary-800/50" />
      <div className="h-11 w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2.5 p-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-[130px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}