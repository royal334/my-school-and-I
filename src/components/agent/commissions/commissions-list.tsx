'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CommissionCard } from './commission-card';
import { COMMISSION_FILTERS, type CommissionRecord } from './types';

interface CommissionsListProps {
  loading: boolean;
  commissions: CommissionRecord[];
  filter: string;
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5" aria-hidden>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

export function CommissionsList({ loading, commissions, filter }: CommissionsListProps) {
  if (loading) return <ListSkeleton />;

  if (commissions.length === 0) {
    const filterLabel = COMMISSION_FILTERS.find((f) => f.key === filter)?.label.toLowerCase() ?? '';

    return (
      <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
          <Wallet className="size-6 text-primary-600 dark:text-primary-300" aria-hidden />
        </span>
        <h2 className="text-xl tracking-tight text-foreground">
          No {filterLabel} commissions yet
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          When a student rents a property you submitted, your commission will appear here.
        </p>
        <Link
          href="/agent/properties"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 dark:hover:bg-primary-500"
        >
          View my properties
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5">
      {commissions.map((c) => (
        <CommissionCard key={c.id} record={c} />
      ))}
    </div>
  );
}
