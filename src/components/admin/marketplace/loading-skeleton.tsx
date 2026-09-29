interface LoadingSkeletonProps {
  count?: number;
  /** Row height in px. */
  height?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 4, height = 72, className }: LoadingSkeletonProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className ?? ''}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-border bg-muted"
          style={{ height }}
        />
      ))}
    </div>
  );
}
