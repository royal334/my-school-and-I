import { Gift } from 'lucide-react';

export function ReferralsEmptyState({ filter }: { filter: string }) {
  const scope = filter ? `${filter} ` : '';

  return (
    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-[#D6E5DF] px-6 py-12 text-center dark:border-white/10">
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Gift className="size-5 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>
      <p className="text-[13px] text-stone-500 dark:text-stone-300">
        No {scope}referrals found.
      </p>
      <p className="max-w-xs text-xs text-stone-400 dark:text-stone-500">
        Referrals appear here once a student refers someone and the resulting tenancy is verified.
      </p>
    </div>
  );
}
