'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  /** Tailwind text colour class for the number. */
  tone: string;
  icon: string;
  onClick?: () => void;
}

export function StatCard({ label, value, tone, icon, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-3.5 text-left transition-all duration-150',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('font-mono text-[26px] font-medium leading-none', tone)}>{value}</p>
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </button>
  );
}
