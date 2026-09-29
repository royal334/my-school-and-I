'use client';

import { FilterChips } from './filter-chips';
import { ReportCard } from './report-card';
import { EmptyState } from './empty-state';
import { LoadingSkeleton } from './loading-skeleton';
import { REPORT_STATUS_FILTERS, getFilterLabel } from './constants';
import type { AdminReport, AdminReportAction } from './types';

interface ReportsTabProps {
  reports: AdminReport[];
  loading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  onAction: (reportId: string, action: AdminReportAction, listingId?: string) => void;
}

export function ReportsTab({
  reports,
  loading,
  filter,
  onFilterChange,
  onAction,
}: ReportsTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <FilterChips filters={REPORT_STATUS_FILTERS} value={filter} onChange={onFilterChange} />

      {loading ? (
        <LoadingSkeleton count={3} height={120} />
      ) : reports.length === 0 ? (
        <EmptyState
          title={`No ${getFilterLabel(filter).toLowerCase()} reports`}
          description="Nothing needs attention in this bucket right now."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}
