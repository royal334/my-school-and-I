'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  LEVEL_OPTIONS,
  SEMESTER_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from './constants';
import { extractCategory, extractSemester, splitSubmissionTitle } from './utils';
import type { MaterialSubmission } from './types';

const inputClass = cn(
  'w-full rounded-lg border border-[#C8E8DA] bg-white px-3 py-2 text-[13px] outline-none transition-colors',
  'placeholder:text-stone-400 focus:border-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white',
);

const labelClass = 'mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-300';

const selectClass = cn(inputClass, 'cursor-pointer appearance-none');

const actionButtonClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export function SubmissionActionPanel({
  submission,
  onReviewed,
}: {
  submission: MaterialSubmission;
  onReviewed: (id: string, status: 'approved' | 'rejected') => void;
}) {
  const { code, name } = splitSubmissionTitle(submission.title);

  const [courseCode, setCourseCode] = useState(code);
  const [courseTitle, setCourseTitle] = useState(name);
  const [level, setLevel] = useState(String(submission.level ?? 100));
  const [semester, setSemester] = useState(String(extractSemester(submission.description) ?? 1));
  const [creditUnits, setCreditUnits] = useState('');
  const [type, setType] = useState(extractCategory(submission.category));
  const [isPremium, setIsPremium] = useState(false);
  const [reason, setReason] = useState('');

  const [saving, setSaving] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const courseReady = courseCode.trim().length > 0 && courseTitle.trim().length > 0;
  const validCreditUnits = Number.isSafeInteger(Number(creditUnits)) && Number(creditUnits) > 0;
  const canApprove = courseReady && validCreditUnits && saving === null;
  const canReject = reason.trim().length > 0 && saving === null;

  async function review(action: 'approve' | 'reject') {
    setSaving(action);
    setError('');

    try {
      const res = await fetch(`/api/admin/materials/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'approve'
            ? {
                action,
                courseCode: courseCode.trim(),
                courseTitle: courseTitle.trim(),
                level: Number(level),
                semester: Number(semester),
                creditUnits: Number(creditUnits),
                type,
                isPremium,
                description: submission.description,
              }
            : { action, rejectionReason: reason.trim() },
        ),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onReviewed(submission.id, action === 'approve' ? 'approved' : 'rejected');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message, { position: 'top-center' });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-[#D6E5DF] pt-3 dark:border-white/10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
        Approve &amp; publish
      </p>

      <p className="-mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        Check the course details below. A matching course is created automatically if the
        codebook does not have this one yet. Credit units are used only for a newly created course.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <label htmlFor={`code-${submission.id}`} className={labelClass}>
            Course code
          </label>
          <input
            id={`code-${submission.id}`}
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="e.g. EEE301"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`level-${submission.id}`} className={labelClass}>
            Level
          </label>
          <select
            id={`level-${submission.id}`}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={selectClass}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-card">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`title-${submission.id}`} className={labelClass}>
            Course title
          </label>
          <input
            id={`title-${submission.id}`}
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g. Electrical Power Systems I"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`semester-${submission.id}`} className={labelClass}>
            Semester
          </label>
          <select
            id={`semester-${submission.id}`}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className={selectClass}
          >
            {SEMESTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-card">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`credit-units-${submission.id}`} className={labelClass}>
            Credit units
          </label>
          <input
            id={`credit-units-${submission.id}`}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={creditUnits}
            onChange={(e) => setCreditUnits(e.target.value)}
            placeholder="e.g. 3"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`type-${submission.id}`} className={labelClass}>
            Material type
          </label>
          <select
            id={`type-${submission.id}`}
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={selectClass}
          >
            {MATERIAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-card">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
          className="size-4 cursor-pointer accent-primary-600"
        />
        <span className="text-[13px] text-stone-600 dark:text-stone-300">
          Premium — require an active subscription to access
        </span>
      </label>

      <button
        type="button"
        onClick={() => review('approve')}
        disabled={!canApprove}
        className={cn(
          actionButtonClass,
          'border-success/25 bg-success-bg text-success hover:bg-success/15',
        )}
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        {saving === 'approve' ? 'Publishing…' : 'Approve & publish to library'}
      </button>

      <div className="mt-1 border-t border-[#D6E5DF] pt-3 dark:border-white/10">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-error">
          Reject instead
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Tell the student why this was rejected…"
          aria-label="Rejection reason"
          className={cn(inputClass, 'resize-y')}
        />
        <button
          type="button"
          onClick={() => review('reject')}
          disabled={!canReject}
          className={cn(
            actionButtonClass,
            'mt-2 border-error/25 bg-error-bg text-error hover:bg-error/15',
          )}
        >
          <XCircle className="size-4 shrink-0" aria-hidden />
          {saving === 'reject' ? 'Rejecting…' : 'Reject submission'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-error-bg px-3 py-2 text-xs text-error-text">
          {error}
        </p>
      )}
    </div>
  );
}
