'use client';

import { StatCard } from './stat-card';
import { SectionTitle } from './section-title';
import type { AdminMarketplaceTab, AdminStats } from './types';

interface OverviewTabProps {
  stats: AdminStats | null;
  onSelectTab: (tab: AdminMarketplaceTab) => void;
}

export function OverviewTab({ stats, onSelectTab }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          label="Active listings"
          value={stats?.total_active ?? 0}
          tone="text-success-text"
          icon="🛍️"
          onClick={() => onSelectTab('listings')}
        />
        <StatCard
          label="Sold listings"
          value={stats?.total_sold ?? 0}
          tone="text-info-text"
          icon="🤝"
          onClick={() => onSelectTab('listings')}
        />
        <StatCard
          label="Boosted listings"
          value={stats?.total_boosted ?? 0}
          tone="text-accent-700 dark:text-accent-400"
          icon="🔥"
          onClick={() => onSelectTab('listings')}
        />
        <StatCard
          label="Pending reports"
          value={stats?.pending_reports ?? 0}
          tone={stats?.pending_reports ? 'text-error-text' : 'text-muted-foreground'}
          icon="🚩"
          onClick={() => onSelectTab('reports')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <SectionTitle>Quick actions</SectionTitle>
        <button
          type="button"
          onClick={() => onSelectTab('reports')}
          className="cursor-pointer rounded-xl border border-border bg-card px-3.5 py-3 text-left text-[13px] font-medium text-foreground transition-colors hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-500/10"
        >
          🚩 Review pending reports
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('listings')}
          className="cursor-pointer rounded-xl border border-border bg-card px-3.5 py-3 text-left text-[13px] font-medium text-foreground transition-colors hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-500/10"
        >
          🛍️ Browse all listings
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <SectionTitle>Marketplace today</SectionTitle>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
          <div>
            <p className="font-mono text-[22px] font-medium leading-none text-primary-600 dark:text-primary-300">
              {stats?.total_listings_today ?? 0}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">New listings posted today</p>
          </div>
          <span className="text-2xl" aria-hidden>
            📈
          </span>
        </div>
      </div>
    </div>
  );
}
