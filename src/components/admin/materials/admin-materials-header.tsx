'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_MATERIALS_TABS, ADMIN_MATERIALS_TAB_LABELS } from './constants';
import type { AdminMaterialsTab } from './types';

export function AdminMaterialsHeader({
  activeTab,
  onTabChange,
  pendingSubmissions,
}: {
  activeTab: AdminMaterialsTab;
  onTabChange: (tab: AdminMaterialsTab) => void;
  pendingSubmissions: number;
}) {
  return (
    <header className="bg-primary-600 px-4 pt-4 dark:bg-primary-800">
      <div className="mb-4">
        <Link href="/admin" className="mb-1 inline-flex items-center gap-2 no-underline">
          <ArrowLeft className="size-4 text-white" />
          <span className="text-sm text-white/70">Back to admin</span>
        </Link>
        <h1 className="font-display text-xl tracking-tight text-white">Materials</h1>
        <p className="mt-0.5 text-xs text-primary-200 dark:text-primary-300">
          Review submissions and manage the library
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto" role="tablist">
        {ADMIN_MATERIALS_TABS.map((tab) => {
          const selected = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(tab)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 bg-transparent px-4 py-2.5 text-[13px] transition-colors duration-150',
                selected
                  ? 'border-primary-200 font-medium text-white'
                  : 'border-transparent font-normal text-white/60 hover:text-white/80',
              )}
            >
              {ADMIN_MATERIALS_TAB_LABELS[tab]}
              {tab === 'submissions' && pendingSubmissions > 0 && (
                <span className="rounded-full bg-error px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-white">
                  {pendingSubmissions}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
