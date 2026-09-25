import { addDays, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Unit } from './types';

export function VerificationWarning({ unit }: { unit: Unit }) {
  const isOverdue = unit.verification_due_at && new Date(unit.verification_due_at) < new Date();
  const isDueSoon = unit.verification_due_at && new Date(unit.verification_due_at) < addDays(new Date(), 3);

  if (!(isOverdue || isDueSoon) || unit.availability_status !== 'available') return null;

  return (
    <div
      className={cn(
        'rounded-[10px] border px-3.5 py-3',
        isOverdue ? 'border-error/25 bg-error/5' : 'border-[#E8A020]/25 bg-[#E8A020]/5',
      )}
    >
      <p className={cn('text-[13px] font-medium', isOverdue ? 'text-error' : 'text-[#9E6A08]')}>
        {isOverdue ? '⚠️ Verification overdue' : '⏰ Verification due soon'}
      </p>
      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
        Due {unit.verification_due_at
          ? formatDistanceToNow(new Date(unit.verification_due_at), { addSuffix: true })
          : 'now'}
      </p>
    </div>
  );
}