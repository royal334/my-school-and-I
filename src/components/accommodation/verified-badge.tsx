import { formatDistanceToNow } from 'date-fns';

export function VerifiedBadge({ verifiedAt }: { verifiedAt: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#1A7A52]/10 px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] text-[#1A7A52] dark:bg-[#7EC8A0]/10 dark:text-[#7EC8A0]">
      ✓ Verified {formatDistanceToNow(new Date(verifiedAt), { addSuffix: true })}
    </span>
  );
}