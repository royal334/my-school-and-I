'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STEPS } from './constants';
import {
  STEP_FIELDS,
  accommodationSubmissionSchema,
  defaultValues,
  type SubmitAccommodationValues,
} from './schema';
import { EarnBadge } from './earn-badge';
import { FacilitiesStep } from './facilities-step';
import { OwnerStep } from './owner-step';
import { PhotosStep } from './photos-step';
import { PropertyStep } from './property-step';
import { SubmitHeader } from './submit-header';
import { SubmitStepBar } from './step-bar';

export function SubmitAccommodationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const methods = useForm<SubmitAccommodationValues>({
    resolver: zodResolver(accommodationSubmissionSchema),
    defaultValues,
  });

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else router.back();
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    if (fields.length > 0) {
      const valid = await methods.trigger(fields);
      if (!valid) return;
    }
    setError('');

    // Submit after the facilities step, then move to uploads.
    if (step === 2) {
      setSubmitting(true);
      try {
        const values = methods.getValues();
        const res = await fetch('/api/accommodation/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            expected_price: values.expected_price ? parseFloat(values.expected_price) : null,
          }),
        });
        const result = (await res.json()) as {
          error?: string;
          submission?: { id: string };
        };
        if (!res.ok) throw new Error(result.error || 'Failed to submit');
        setSubmissionId(result.submission?.id ?? null);
        setStep(3);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to submit');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep(s => s + 1);
  };

  const isLastDataStep = step === 2;

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-[#0F1110]">
      <SubmitHeader step={step} onBack={handleBack} />

      <div className="bg-white pb-3 dark:bg-[#171918]">
        <SubmitStepBar current={step} total={STEPS.length} />
      </div>

      {step < 3 && <EarnBadge />}

      <FormProvider {...methods}>
        <div className="px-4 pt-5">
          {step === 0 && <PropertyStep />}
          {step === 1 && <OwnerStep />}
          {step === 2 && <FacilitiesStep />}
          {step === 3 && submissionId && (
            <PhotosStep
              submissionId={submissionId}
              onComplete={() => router.push('/dashboard/accommodation/my-submissions')}
            />
          )}

          {error && (
            <p className="mt-3 rounded bg-[rgba(196,75,42,0.06)] px-3.5 py-2.5 text-[13px] text-[#C44B2A] dark:bg-[rgba(232,105,74,0.1)] dark:text-[#E8694A]">
              {error}
            </p>
          )}

          {step < 3 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className={[
                  'min-h-[50px] w-full cursor-pointer rounded px-5 py-[13px] text-[15px] font-medium text-white transition-colors',
                  submitting
                    ? 'cursor-not-allowed bg-[#4A8C73]'
                    : 'bg-[#1A3C34] hover:bg-[#163229] dark:bg-[#7EC8A0] dark:text-[#0F1110] dark:hover:bg-[#A8D8C2]',
                ].join(' ')}
              >
                {submitting
                  ? 'Submitting…'
                  : isLastDataStep
                    ? 'Submit'
                    : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </FormProvider>
    </div>
  );
}