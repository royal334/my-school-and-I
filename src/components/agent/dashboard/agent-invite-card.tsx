import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { AGENT_COMMISSION_RATE } from '../constants';

export function AgentInviteCard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Building2 className="size-7 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>

      <div>
        <h1 className="text-2xl tracking-tight text-foreground">Agent portal</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Submit verified accommodation and earn {AGENT_COMMISSION_RATE}% on every rental.
        </p>
      </div>

      <Link
        href="/agent/status"
        className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-[15px] font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 dark:hover:bg-primary-500"
      >
        View application status
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
