import Link from 'next/link';
import { ArrowRight, Wallet } from 'lucide-react';
import { formatNaira } from '../commissions/format';
import type { DashboardCommissionSummary } from './types';

interface CommissionSummaryCardProps {
  summary: DashboardCommissionSummary;
}

function SummaryRow({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-[13px] font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

export function CommissionSummaryCard({ summary }: CommissionSummaryCardProps) {
  const awaitingPayment = summary.total_confirmed - summary.total_paid;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
        <Wallet className="size-3.5" aria-hidden />
        Commission summary
      </p>

      <SummaryRow
        label="Pending confirmation"
        value={`${summary.total_pending} record${summary.total_pending !== 1 ? 's' : ''}`}
        valueClass="text-warning-text"
      />
      <SummaryRow
        label="Confirmed (awaiting payment)"
        value={formatNaira(awaitingPayment)}
        valueClass="text-info-text"
      />
      <SummaryRow
        label="Payment recorded"
        value={formatNaira(summary.total_paid)}
        valueClass="text-success-text"
      />

      <Link
        href="/agent/commissions"
        className="mt-3.5 flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg bg-muted px-4 text-[13px] font-medium text-primary no-underline transition-colors hover:bg-muted/70 dark:text-primary-300"
      >
        View all commission records
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}
