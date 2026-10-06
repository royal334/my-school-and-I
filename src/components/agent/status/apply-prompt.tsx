import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChartNoAxesColumn,
  Home,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { AGENT_COMMISSION_RATE } from '../constants';

const PERKS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Home, label: 'Submit properties for verification' },
  { icon: BadgeCheck, label: 'Properties go live after our inspection' },
  { icon: Wallet, label: `Earn ${AGENT_COMMISSION_RATE}% on every rental` },
  { icon: ChartNoAxesColumn, label: 'Track your submissions & commissions' },
];

export function ApplyPrompt() {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Building2 className="size-7 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>

      <div>
        <h2 className="text-2xl tracking-tight text-foreground">Become a Campus&amp;Me agent</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Submit accommodation properties and earn {AGENT_COMMISSION_RATE}% commission on every
          successful rental.
        </p>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-2">
        {PERKS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left"
          >
            <Icon
              className="size-4 shrink-0 text-primary-600 dark:text-primary-300"
              aria-hidden
            />
            <span className="text-[13px] text-foreground">{label}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/agent/apply"
        className="inline-flex min-h-[50px] w-full max-w-xs items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-[15px] font-medium text-primary-foreground no-underline transition-colors hover:bg-primary-700 dark:hover:bg-primary-500"
      >
        Apply to become an agent
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}