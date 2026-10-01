'use client';

import { Inbox } from 'lucide-react';
import { FilterChips } from './filter-chips';
import { LoadingSkeleton } from './loading-skeleton';
import { EmptyState } from './empty-state';
import { SubmissionCard } from './submission-card';
import { SUBMISSION_STATUS_FILTERS, getFilterLabel } from './constants';
import type { MaterialSubmission } from './types';

export function SubmissionsTab({
  submissions,
  loading,
  filter,
  onFilterChange,
  onReviewed,
}: {
  submissions: MaterialSubmission[];
  loading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  onReviewed: (id: string, status: 'approved' | 'rejected') => void;
}) {
  return (
    <div>
      <FilterChips
        filters={SUBMISSION_STATUS_FILTERS}
        value={filter}
        onChange={onFilterChange}
        className="mb-3.5"
      />

      {loading ? (
        <LoadingSkeleton count={3} height={170} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={`No ${getFilterLabel(filter).toLowerCase()} submissions`}
          description="When a student submits a material for review it appears here, ready to approve or reject."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onReviewed={onReviewed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
