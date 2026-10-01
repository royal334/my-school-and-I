'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

interface Submission {
  id: string;
  property_name: string;
  area: string;
  room_type: string;
  expected_price: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  matched_unit_id: string | null;
  matched_unit_status: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; desc: string }> = {
  pending: {
    label: 'Pending review',
    text: 'text-warning-text',
    bg: 'bg-warning-bg',
    desc: 'Our team will review this submission soon.',
  },
  reviewing: {
    label: 'Under review',
    text: 'text-info-text',
    bg: 'bg-info-bg',
    desc: 'Our team is contacting the landlord/caretaker.',
  },
  duplicate: {
    label: 'Duplicate',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    desc: 'This property was already submitted by another student.',
  },
  approved: {
    label: 'Approved',
    text: 'text-success-text',
    bg: 'bg-success-bg',
    desc: 'This property has been verified and listed on Campus&Me.',
  },
  rejected: {
    label: 'Rejected',
    text: 'text-error-text',
    bg: 'bg-error-bg',
    desc: 'This submission could not be verified.',
  },
};

function SubmissionCard({ submission }: { submission: Submission }) {
  const config = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {/* Status bar */}
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 ${config.bg}`}>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="mb-1 text-base text-foreground">{submission.property_name}</h3>

        <p className="mb-2 text-[13px] text-muted-foreground">
          📍 {submission.area} · {submission.room_type}
          {submission.expected_price && ` · ${formatPrice(submission.expected_price)}/yr`}
        </p>

        <p className={`text-xs leading-relaxed ${config.text}`}>{config.desc}</p>

        {submission.admin_notes && (
          <div className="mt-2.5 rounded bg-muted px-3 py-2 text-xs leading-relaxed text-foreground">
            <strong>Note from team:</strong> {submission.admin_notes}
          </div>
        )}

        {/* If approved and matched to a unit */}
        {submission.status === 'approved' && submission.matched_unit_id && (
          submission.matched_unit_status === 'available' ? (
            <Link
              href={`/dashboard/accommodation/${submission.matched_unit_id}`}
              className="mt-3 inline-block min-h-9 cursor-pointer rounded bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-700 dark:hover:bg-primary-500"
            >
              View live listing →
            </Link>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {submission.matched_unit_status === 'rented'
                ? '🏠 This unit has been rented through Campus&Me.'
                : submission.matched_unit_status
                  ? 'This listing is being verified and will go live shortly.'
                  : 'This listing is not live yet.'}
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accommodation/submissions')
      .then(r => r.json())
      .then(d => setSubmissions(d.submissions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-primary-950 px-4 py-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/accommodation" className="gap-2 text-white hover:text-accent-400">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-xl tracking-[-0.01em] text-white">My submissions</h1>
            <p className="text-xs text-primary-300">Track vacancies you&apos;ve reported</p>
          </div>
        </div>
        <Link
          href="/dashboard/accommodation/submit"
          className="min-h-9 inline-flex items-center rounded bg-accent-500 px-3.5 py-2 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent-600"
        >
          + New
        </Link>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-30 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
            <span className="text-4xl">🏠</span>
            <h2 className="text-xl text-foreground">No submissions yet</h2>
            <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              Know of a vacant accommodation near campus? Report it and earn a reward if it gets rented
              through Campus&Me.
            </p>
            <Link
              href="/dashboard/accommodation/submit"
              className="min-h-[44px] inline-flex items-center rounded bg-primary px-6 py-[11px] text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-700 dark:hover:bg-primary-500"
            >
              Submit a vacancy
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Referral note */}
            <div className="rounded border border-warning/25 bg-warning-bg px-3.5 py-2.5 text-xs leading-relaxed text-warning-text">
              🏆 You earn a referral reward when an approved submission is rented through Campus&Me.
            </div>

            {submissions.map(s => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}