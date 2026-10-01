import { formatDistanceToNow } from 'date-fns';
import { Trophy } from 'lucide-react';
import { formatPrice } from './utils';

export function ReferralRewardRow({
  rewardAmount,
  paidAt,
}: {
  rewardAmount: number | null;
  paidAt: string | null;
}) {
  if (!rewardAmount) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 dark:border-accent-500/25 dark:bg-accent-500/10">
      <Trophy className="size-3.5 shrink-0 text-accent-600 dark:text-accent-300" aria-hidden />
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-700 dark:text-accent-300">
        Reward
      </span>
      <span className="font-mono text-sm font-semibold text-accent-800 dark:text-accent-200">
        {formatPrice(rewardAmount)}
      </span>
      {paidAt && (
        <span className="ml-auto text-[11px] text-stone-500 dark:text-stone-400">
          paid {formatDistanceToNow(new Date(paidAt), { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
