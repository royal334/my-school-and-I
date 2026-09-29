'use client';

import { getReportReasonLabel } from '../constants';
import type { AdminListingReport } from '../types';

interface PendingReportsAlertProps {
  reports: AdminListingReport[];
}

export function PendingReportsAlert({ reports }: PendingReportsAlertProps) {
  if (reports.length === 0) return null;

  return (
    <div className="rounded-xl border border-error/25 bg-error-bg px-4 py-3">
      <p className="mb-1.5 text-[13px] font-semibold text-error-text">
        🚩 {reports.length} pending report{reports.length > 1 ? 's' : ''}
      </p>
      {reports.map((report) => (
        <p key={report.id} className="text-xs text-error-text/80">
          · {getReportReasonLabel(report.reason)} — {report.reporter?.full_name || 'Unknown'}
        </p>
      ))}
    </div>
  );
}
