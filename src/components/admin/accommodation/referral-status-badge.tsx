import { cn } from '@/lib/utils';

/**
 * Badge tints are built from the semantic theme tokens (`--success-bg`,
 * `--warning-bg`, …) rather than fixed hex pairs. Those tokens are redefined
 * inside the `.dark` scope, so a single class adapts to both colour schemes
 * without a second map.
 */
const ELIGIBILITY_CLASSES: Record<string, string> = {
  eligible: 'bg-success-bg text-success-text',
  pending: 'bg-warning-bg text-warning-text',
  paid: 'bg-success-bg text-success-text',
  disputed: 'bg-warning-bg text-warning-text',
  rejected: 'bg-muted text-muted-foreground',
};

const PAYOUT_CLASSES: Record<string, string> = {
  unpaid: 'bg-warning-bg text-warning-text',
  processing: 'bg-info-bg text-info-text',
  paid: 'bg-success-bg text-success-text',
};

function Badge({
  status,
  classes,
  prefix,
}: {
  status: string;
  classes: Record<string, string>;
  prefix?: string;
}) {
  const label = status.replace(/_/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
        classes[status] ?? classes.pending ?? 'bg-muted text-muted-foreground',
      )}
    >
      {prefix ? `${prefix} ${label}` : label}
    </span>
  );
}

export function EligibilityBadge({ status }: { status: string }) {
  return <Badge status={status} classes={ELIGIBILITY_CLASSES} />;
}

export function PayoutBadge({ status }: { status: string }) {
  return <Badge status={status} classes={PAYOUT_CLASSES} prefix="Payout" />;
}
