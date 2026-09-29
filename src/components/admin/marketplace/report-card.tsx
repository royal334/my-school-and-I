'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Ban, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminListingPath, getReportReasonLabel, getReportStatusTone } from './constants';
import type { AdminReport, AdminReportAction } from './types';

interface ReportCardProps {
  report: AdminReport;
  onAction: (reportId: string, action: AdminReportAction, listingId?: string) => void;
}

export function ReportCard({ report, onAction }: ReportCardProps) {
  const statusTone = getReportStatusTone(report.status);
  const listingId = report.listing?.id;
  const isPending = report.status === 'pending';

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className={cn('flex items-center justify-between gap-2 px-3.5 py-2', statusTone.tone)}>
        <span className="text-[11px] font-semibold">{statusTone.label}</span>
        <span className="text-[11px] opacity-80">
          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="p-3.5">
        <p className="mb-1.5 text-[13px] font-semibold text-error-text">
          {getReportReasonLabel(report.reason)}
        </p>

        {report.listing && (
          <Link
            href={adminListingPath(report.listing.id)}
            className="mb-1 inline-flex max-w-full items-center gap-1 text-[13px] font-medium text-primary-600 no-underline hover:underline dark:text-primary-300"
          >
            <span className="truncate">{report.listing.title}</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </Link>
        )}

        <p className="text-xs text-muted-foreground">
          Reported by {report.reporter?.full_name || 'Unknown'}
          {report.listing?.seller_name ? ` · sold by ${report.listing.seller_name}` : ''}
        </p>

        {report.details && (
          <blockquote className="mt-2.5 rounded-lg border-l-2 border-border bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            “{report.details}”
          </blockquote>
        )}

        {isPending && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAction(report.id, 'remove_listing', listingId)}
              disabled={!listingId}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-error/25 bg-error-bg px-3 py-2 text-xs font-medium text-error-text transition-colors hover:border-error/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban className="size-3.5" />
              Remove listing
            </button>
            <button
              type="button"
              onClick={() => onAction(report.id, 'dismiss')}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckCircle2 className="size-3.5" />
              Dismiss
            </button>
            {listingId && (
              <Link
                href={adminListingPath(listingId)}
                className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary-700"
              >
                View
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
