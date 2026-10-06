'use client';

import { COMMISSION_FILTERS } from './types';
import { cn } from '@/lib/utils';

interface CommissionFilterTabsProps {
  active: string;
  onChange: (key: string) => void;
  confirmedCount: number;
}

export function CommissionFilterTabs({
  active,
  onChange,
  confirmedCount,
}: CommissionFilterTabsProps) {
  return (
    <div className="mt-3 border-b border-border bg-card">
      <div className="custom-scrollbar flex overflow-x-auto px-4" role="tablist" aria-label="Filter commissions">
        {COMMISSION_FILTERS.map((f) => {
          const isActive = active === f.key;
          const badge = f.key === 'confirmed' ? confirmedCount : 0;

          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(f.key)}
              className={cn(
                'flex flex-shrink-0 cursor-pointer items-center whitespace-nowrap border-b-2 px-3.5 py-3 text-sm transition-colors',
                isActive
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              {badge > 0 && (
                <span className="ml-1.5 rounded-full bg-info-bg px-1.5 py-0.5 text-[10px] font-semibold text-info-text">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
