'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ExternalLink, FileText, GraduationCap, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardBody } from './card';
import { StatusBadge } from './status-badge';
import { SubmissionActionPanel } from './submission-action-panel';
import { getMaterialTypeLabel, getSubmissionStatusTone } from './constants';
import { formatBytes } from './utils';
import type { MaterialSubmission } from './types';

export function SubmissionCard({
  submission,
  onReviewed,
}: {
  submission: MaterialSubmission;
  onReviewed: (id: string, status: 'approved' | 'rejected') => void;
}) {
  const [reviewing, setReviewing] = useState(false);
  const tone = getSubmissionStatusTone(submission.status);
  const isPending = submission.status === 'pending';
  const submitter = submission.submitter;

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b border-[#D6E5DF] px-4 py-2.5 dark:border-white/10',
          tone.tone,
        )}
      >
        <StatusBadge tone={tone} />
        <span className="text-[11px] opacity-80">
          {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
        </span>
      </div>

      <CardBody>
        <h3 className="font-display text-[15px] tracking-tight text-primary-700 dark:text-white">
          {submission.title}
        </h3>

        <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
          {submitter?.full_name || 'Unknown student'}
          {submitter?.matric_number ? ` · ${submitter.matric_number}` : ''}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <MetaChip icon={FileText} label={getMaterialTypeLabel(submission.category)} />
          {submission.level && (
            <MetaChip icon={GraduationCap} label={`${submission.level} Level`} />
          )}
          {submission.faculty && (
            <MetaChip icon={Landmark} label={submission.faculty.name} />
          )}
        </div>

        {submission.file_name && (
          <p className="mt-2.5 rounded-lg bg-muted px-3 py-2 text-xs text-stone-600 dark:bg-white/5 dark:text-stone-300">
            <span className="font-mono">{submission.file_name}</span>
            <span className="text-stone-400"> · {formatBytes(submission.file_size)}</span>
          </p>
        )}

        {submission.file_path && submission.status !== 'approved' && (
          <a
            href={`/api/admin/materials/submissions/${encodeURIComponent(submission.id)}/file`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-muted dark:text-primary-200"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View submitted file
          </a>
        )}

        {submission.description && (
          <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            {submission.description}
          </p>
        )}

        {submission.status === 'rejected' && submission.rejection_reason && (
          <p className="mt-2.5 rounded-lg bg-error-bg px-3 py-2 text-xs leading-relaxed text-error-text">
            Rejected: {submission.rejection_reason}
          </p>
        )}

        {isPending && (
          <>
            <button
              type="button"
              onClick={() => setReviewing((open) => !open)}
              aria-expanded={reviewing}
              className="mt-3 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200"
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform', reviewing && 'rotate-180')}
                aria-hidden
              />
              {reviewing ? 'Hide review actions' : 'Review submission'}
            </button>

            {reviewing && (
              <SubmissionActionPanel
                submission={submission}
                onReviewed={(id, status) => {
                  onReviewed(id, status);
                  setReviewing(false);
                }}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function MetaChip({
  icon: Icon,
  label,
}: {
  icon: typeof FileText;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] text-primary-700 dark:bg-primary-500/15 dark:text-primary-200">
      <Icon className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
