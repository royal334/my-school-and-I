import { Trophy } from 'lucide-react';
import { AGENT_COMMISSION_RATE } from '../constants';

export function EarnBanner() {
  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-accent-500/25 bg-accent-500/[0.07] px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-500/15">
        <Trophy className="size-4 text-accent-600 dark:text-accent-400" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground">
          Earn {AGENT_COMMISSION_RATE}% on every rental
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Submit verified accommodation properties to Campus&Me. When a student rents one of your
          listings, you earn {AGENT_COMMISSION_RATE}% of the rent.
        </p>
      </div>
    </div>
  );
}