'use client';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Panel } from '../panel';
import { SectionTitle } from '../section-title';
import { getReportReasonLabel, getReportStatusTone } from '../constants';
import type { AdminListingReport } from '../types';

export function ListingReportsCard({ reports }: { reports: AdminListingReport[] }) {
  if (reports.length === 0) return null;

  return (
    <Panel>
      <SectionTitle>All reports ({reports.length})</SectionTitle>

      <div className="flex flex-col gap-2">
        {reports.map((report) => {
          const isPending = report.status === 'pending';
          const statusTone = getReportStatusTone(report.status);

          return (
            <div
              key={report.id}
              className={cn(
                'rounded-lg border px-3 py-2.5',
                isPending
                  ? 'border-error/20 bg-error-bg'
                  : 'border-transparent bg-muted',
              )}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-error-text">
                  {getReportReasonLabel(report.reason)}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    statusTone.tone,
                  )}
                >
                  {statusTone.label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {report.reporter?.full_name || 'Unknown'} ·{' '}
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
