"use client";

interface AttentionBannerProps {
  needsAttention: number;
  onViewClick: () => void;
}

export function AttentionBanner({ needsAttention, onViewClick }: AttentionBannerProps) {
  if (needsAttention === 0) return null;

  return (
    <div className="mx-4 mt-3 flex items-center gap-2.5 rounded-xl border border-error/25 bg-error-bg px-3.5 py-3">
      <span className="text-lg">??</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-error-text">
          {needsAttention} submission{needsAttention > 1 ? "s need" : " needs"} correction
        </p>
        <p className="text-xs text-muted-foreground">
          Review admin feedback and update your submission.
        </p>
      </div>
      <button
        onClick={onViewClick}
        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-error-text transition-colors hover:bg-error/10"
      >
        View ?
      </button>
    </div>
  );
}
