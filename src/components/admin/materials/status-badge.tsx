import { cn } from '@/lib/utils';
import type { StatusTone } from './constants';

/** Status pill. Tones come from semantic tokens, so light and dark both resolve. */
export function StatusBadge({ tone, className }: { tone: StatusTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]',
        tone.tone,
        className,
      )}
    >
      {tone.label}
    </span>
  );
}
