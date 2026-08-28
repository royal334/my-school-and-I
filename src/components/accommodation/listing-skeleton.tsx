export function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D6E5DF] bg-card dark:border-white/10">
      <div className="h-40 animate-pulse bg-[#E8F5EF] dark:bg-[#1E211F]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#E8F5EF] dark:bg-[#1E211F]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#E8F5EF] dark:bg-[#1E211F]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#E8F5EF] dark:bg-[#1E211F]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#E8F5EF] dark:bg-[#1E211F]" />
      </div>
    </div>
  );
}