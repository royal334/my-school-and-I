'use client';

import { ArrowLeft } from 'lucide-react';
import { formatNaira } from './format';

interface CommissionsHeaderProps {
  onBack: () => void;
  confirmedTotal: number;
  paidTotal: number;
  showTotals: boolean;
}

function TotalTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-white/10 px-3.5 py-2.5 dark:bg-white/[0.07]">
      <p className="text-[11px] text-primary-100 dark:text-primary-200">{label}</p>
      <p
        className={
          highlight
            ? 'mt-0.5 font-mono text-lg font-semibold text-primary-200 dark:text-primary-100'
            : 'mt-0.5 font-mono text-lg font-semibold text-white'
        }
      >
        {value}
      </p>
    </div>
  );
}

export function CommissionsHeader({
  onBack,
  confirmedTotal,
  paidTotal,
  showTotals,
}: CommissionsHeaderProps) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg tracking-tight text-white">Commission records</h1>
          <p className="mt-0.5 text-xs text-primary-200 dark:text-primary-300">
            Campus&Me does not process payments — these are records only
          </p>
        </div>
      </div>

      {showTotals && (
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <TotalTile label="Confirmed total" value={formatNaira(confirmedTotal)} />
          <TotalTile label="Payment recorded" value={formatNaira(paidTotal)} highlight />
        </div>
      )}
    </header>
  );
}
