export default function BoostLoading() {
  return (
    <div>
      <div className="h-[72px] w-full animate-pulse rounded-xl bg-primary-200/60 dark:bg-primary-800/50" />
      <div className="flex flex-col gap-3 p-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-[120px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}