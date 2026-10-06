import Link from 'next/link';
import {
  ArrowRight,
  CircleUserRound,
  Home,
  Plus,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickAction } from './types';

const ACTIONS: Array<{ icon: LucideIcon; action: QuickAction }> = [
  { icon: Plus, action: { label: 'Submit new property', href: '/agent/properties/submit', icon: 'submit', primary: true } },
  { icon: Home, action: { label: 'My properties', href: '/agent/properties', icon: 'properties' } },
  { icon: Wallet, action: { label: 'Commission records', href: '/agent/commissions', icon: 'commissions' } },
  { icon: CircleUserRound, action: { label: 'My profile', href: '/agent/status', icon: 'profile' } },
];

export function QuickActions() {
  return (
    <section>
      <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
        Quick actions
      </p>

      <div className="flex flex-col gap-2">
        {ACTIONS.map(({ icon: Icon, action }) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-sm no-underline transition-colors',
              action.primary
                ? 'border-primary bg-primary font-medium text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary-500'
                : 'border-border bg-card font-normal text-foreground hover:bg-muted',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{action.label}</span>
            <ArrowRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
