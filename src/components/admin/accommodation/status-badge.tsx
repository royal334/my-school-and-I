import { cn } from '@/lib/utils';
import { STATUS_BADGE_CLASSES, STATUS_BADGE_DARK_CLASSES } from './utils';

export function StatusBadge({
  status,
  onDark = false,
  className,
}: {
  status: string;
  onDark?: boolean;
  className?: string;
}) {
  const text = status.replace(/_/g, ' ');
  const classes = onDark
    ? STATUS_BADGE_DARK_CLASSES[status] ?? 'bg-white/15 text-white/70'
    : STATUS_BADGE_CLASSES[status] ?? 'bg-[#E1EBE6] text-stone-500';

  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
        classes,
        className,
      )}
    >
      {text}
    </span>
  );
}