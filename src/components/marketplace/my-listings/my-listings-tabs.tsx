import Link from 'next/link';
import { MY_LISTINGS_TABS } from '@/components/marketplace/constants';
import { ownedListingsTabHref } from '@/components/marketplace/filters';
import type { OwnedListingsResult } from '@/components/marketplace/types';

interface MyListingsTabsProps {
  active: string;
  counts: OwnedListingsResult['counts'];
}

/** Status tabs are plain links so the list itself stays server-rendered. */
export function MyListingsTabs({ active, counts }: MyListingsTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-border px-4 pb-0">
      {MY_LISTINGS_TABS.map((tab) => {
        const selected = tab.key === active;
        const count = tab.key === 'all' ? counts.all : counts[tab.key];

        return (
          <Link
            key={tab.key}
            href={ownedListingsTabHref(tab.key)}
            scroll={false}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] capitalize transition-colors ${
              selected
                ? 'border-primary-600 font-semibold text-foreground'
                : 'border-transparent font-normal text-muted-foreground'
            }`}
          >
            {tab.key} {tab.key !== 'all' && `(${count})`}
          </Link>
        );
      })}
    </div>
  );
}