'use client';

import Link from 'next/link';
import { ShoppingCart, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestPageLoader } from '@/components/providers/page-loader';

export type MarketTab = 'marketplace' | 'vendors';

const tabs = [
  { id: 'vendors', label: 'Vendors', href: '/dashboard/market?tab=vendors', icon: Store },
  { id: 'marketplace', label: 'Marketplace', href: '/dashboard/market?tab=marketplace', icon: ShoppingCart },
] as const;

export function MarketTabs({ activeTab }: { activeTab: MarketTab }) {
  return (
    <nav
      aria-label="Market sections"
      data-tour="page-market-tabs"
      className="mb-5 border-b border-border"
    >
      <div role="tablist" className="flex gap-1">
        {tabs.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => {
              if (activeTab !== id) requestPageLoader();
            }}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors',
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
