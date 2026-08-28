'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

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
}

const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; desc: string }> = {
  pending: {
    label: 'Pending review',
    text: 'text-[#A07800] dark:text-[#D9A93E]',
    bg: 'bg-[rgba(232,160,32,0.08)] dark:bg-[rgba(232,160,32,0.12)]',
    desc: 'Our team will review this submission soon.',
  },
  reviewing: {
    label: 'Under review',
    text: 'text-[#1A5C8A] dark:text-[#6CB2E8]',
    bg: 'bg-[rgba(26,92,138,0.08)] dark:bg-[rgba(26,92,138,0.14)]',
    desc: 'Our team is contacting the landlord/caretaker.',
  },
  duplicate: {
    label: 'Duplicate',
    text: 'text-[#6B7B75] dark:text-[#9BA19E]',
    bg: 'bg-[rgba(107,123,117,0.08)] dark:bg-[rgba(107,123,117,0.12)]',
    desc: 'This property was already submitted by another student.',
  },
  approved: {
    label: 'Approved',
    text: 'text-[#1A7A52] dark:text-[#5CCB93]',
    bg: 'bg-[rgba(26,122,82,0.08)] dark:bg-[rgba(26,122,82,0.12)]',
    desc: 'This property has been verified and listed on CampusHub.',
  },
  rejected: {
    label: 'Rejected',
    text: 'text-[#C44B2A] dark:text-[#E8694A]',
    bg: 'bg-[rgba(196,75,42,0.08)] dark:bg-[rgba(196,75,42,0.12)]',
    desc: 'This submission could not be verified.',
  },
};

function SubmissionCard({ submission }: { submission: Submission }) {
  const config = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="overflow-hidden rounded-md border-[0.5px] border-[#D6E5DF] bg-[#FFFFFF] dark:border-white/10 dark:bg-[#171918]">
      {/* Status bar */}
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 ${config.bg}`}>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
        <span className="shrink-0 text-[11px] text-[#6B7B75] dark:text-[#9BA19E]">
          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="mb-1 text-base text-[#1A3C34] dark:text-[#ECEEED]">{submission.property_name}</h3>

        <p className="mb-2 text-[13px] text-[#6B7B75] dark:text-[#9BA19E]">
          📍 {submission.area} · {submission.room_type}
          {submission.expected_price && ` · ${formatPrice(submission.expected_price)}/yr`}
        </p>

        <p className={`text-xs leading-relaxed ${config.text}`}>{config.desc}</p>

        {submission.admin_notes && (
          <div className="mt-2.5 rounded bg-[#E8F5EF] px-3 py-2 text-xs leading-relaxed text-[#1A3C34] dark:bg-[#1E211F] dark:text-[#E1E4E2]">
            <strong>Note from team:</strong> {submission.admin_notes}
          </div>
        )}

        {/* If approved and matched to a unit */}
        {submission.status === 'approved' && submission.matched_unit_id && (
          <Link
            href={`/dashboard/accommodation/${submission.matched_unit_id}`}
            className="mt-3 inline-block min-h-[36px] cursor-pointer rounded bg-[#1A3C34] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#163229] dark:bg-[#7EC8A0] dark:text-[#0F1110] dark:hover:bg-[#A8D8C2]"
          >
            View live listing →
          </Link>
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
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-[#0F1110]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-[#1A3C34] px-4 py-4">
        <div>
          <h1 className="text-xl tracking-[-0.01em] text-white">My submissions</h1>
          <p className="text-xs text-[#7EC8A0]">Track vacancies you&apos;ve reported</p>
        </div>
        <Link
          href="/dashboard/accommodation/submit"
          className="min-h-[36px] inline-flex items-center rounded bg-[#E8A020] px-3.5 py-2 text-[13px] font-medium text-[#3A2800] transition-colors hover:bg-[#EAA73A]"
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
                className="h-[120px] animate-pulse rounded-md bg-[#E8F5EF] dark:bg-[#1E211F]"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
            <span className="text-4xl">🏠</span>
            <h2 className="text-xl text-[#1A3C34] dark:text-[#ECEEED]">No submissions yet</h2>
            <p className="max-w-[260px] text-sm leading-relaxed text-[#6B7B75] dark:text-[#9BA19E]">
              Know of a vacant accommodation near campus? Report it and earn a reward if it gets rented
              through CampusHub.
            </p>
            <Link
              href="/dashboard/accommodation/submit"
              className="min-h-[44px] inline-flex items-center rounded bg-[#1A3C34] px-6 py-[11px] text-sm font-medium text-white transition-colors hover:bg-[#163229] dark:bg-[#7EC8A0] dark:text-[#0F1110] dark:hover:bg-[#A8D8C2]"
            >
              Submit a vacancy
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Referral note */}
            <div className="rounded border-[0.5px] border-[rgba(232,160,32,0.25)] bg-[rgba(232,160,32,0.08)] px-3.5 py-2.5 text-xs leading-relaxed text-[#1A3C34]">
              🏆 You earn a referral reward when an approved submission is rented through CampusHub.
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