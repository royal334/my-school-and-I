'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Tab } from './types';
import { ArrowLeft } from 'lucide-react';

const TABS: Tab[] = ['overview', 'leads', 'listings', 'viewings'];

export function AccommodationHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <header className="bg-primary-600 px-4 pt-4 dark:bg-primary-800">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="flex  gap-2">
            <ArrowLeft className="mb-2 h-4 w-4 text-white" />
            <p className="text-sm text-white/60">Back to admin</p>
          </Link>
          <h1 className="font-display text-xl tracking-tight text-white">Accommodation</h1>
          <p className="mt-0.5 text-xs text-primary-300">Operations dashboard</p>
        </div>
        <Link
          href="/dashboard/accommodation/submit"
          className="rounded-lg bg-accent-500 px-3.5 py-2 text-[13px] font-medium text-[#3A2800] no-underline"
        >
          + New property
        </Link>
      </div>

      <div className="flex overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              'cursor-pointer whitespace-nowrap border-b-2 bg-transparent px-4 py-2.5 text-[13px] capitalize transition-colors duration-150',
              activeTab === tab
                ? 'border-primary-300 font-medium text-primary-300'
                : 'border-transparent font-normal text-white/60',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}