'use client';

import { BookOpen, FileCheck2, Inbox, Upload } from 'lucide-react';
import { Card, CardBody } from './card';
import { SectionTitle } from './section-title';
import { StatsGrid } from './stat-card';
import { OVERVIEW_STATS, REVIEWED_STATS } from './constants';
import type { AdminMaterialsStats, AdminMaterialsTab, TabTarget } from './types';

interface QuickLink {
  tab: AdminMaterialsTab;
  title: string;
  description: string;
  icon: typeof BookOpen;
}

const QUICK_LINKS: QuickLink[] = [
  {
    tab: 'submissions',
    title: 'Review submissions',
    description: 'Approve student material submissions or send them back with a reason.',
    icon: FileCheck2,
  },
  {
    tab: 'library',
    title: 'Manage the library',
    description: 'Publish, unpublish or delete anything students can browse.',
    icon: BookOpen,
  },
  {
    tab: 'upload',
    title: 'Upload a material',
    description: 'Add a PDF straight to the library, already published.',
    icon: Upload,
  },
];

export function OverviewTab({
  stats,
  onSelect,
}: {
  stats: AdminMaterialsStats | null;
  onSelect: (target: TabTarget) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionTitle>At a glance</SectionTitle>
        <StatsGrid stats={stats} configs={OVERVIEW_STATS} onSelect={onSelect} />
      </div>

      <div>
        <SectionTitle>Review history</SectionTitle>
        <StatsGrid stats={stats} configs={REVIEWED_STATS} onSelect={onSelect} />
      </div>

      <div>
        <SectionTitle>Jump to</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {QUICK_LINKS.map(({ tab, title, description, icon: Icon }) => (
            <Card key={tab} className="p-0">
              <button
                type="button"
                onClick={() => onSelect({ tab, filter: '' })}
                className="flex w-full cursor-pointer flex-col p-4 text-left transition-all duration-150 hover:border-primary-300 hover:shadow-md dark:hover:border-primary-500/50"
              >
                <Icon
                  className="size-4 shrink-0 text-primary-600 dark:text-primary-300"
                  aria-hidden
                />
                <p className="mt-2 text-[13px] font-medium text-stone-700 dark:text-stone-100">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  {description}
                </p>
              </button>
            </Card>
          ))}
        </div>
      </div>

      {stats?.pending_submissions === 0 && (
        <Card>
          <CardBody className="flex items-center gap-2.5">
            <Inbox className="size-4 shrink-0 text-success" aria-hidden />
            <p className="text-[13px] text-stone-600 dark:text-stone-300">
              Nothing is waiting for review. New submissions will show up here.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
