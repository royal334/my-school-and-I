export default function SavedListingsLoading() {
  return (
    <div>
      <div className="h-[72px] w-full animate-pulse rounded-xl bg-primary-200/60 dark:bg-primary-800/50" />
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-[220px] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}