import { formatDistanceToNow } from 'date-fns';

export function VerifiedBadge({ verifiedAt }: { verifiedAt: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-primary">
      ✓ Verified {formatDistanceToNow(new Date(verifiedAt), { addSuffix: true })}
    </span>
  );
}