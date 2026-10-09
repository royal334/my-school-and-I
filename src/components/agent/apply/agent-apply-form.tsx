'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AGENT_STEP_FIELDS,
  agentApplicationSchema,
  defaultValues,
  type AgentApplicationValues,
} from '../schema';
import { AgentApplyHeader, AgentStepBar } from './agent-apply-header';
import { EarnBanner } from './earn-banner';
import { AboutYouStep } from './about-you-step';
import { AreasBioStep } from './areas-bio-step';
import { FormError, primaryButtonClass } from './form-primitives';
import { requestPageLoader } from '@/components/providers/page-loader';

const LAST_STEP = 1;

export function AgentApplyForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const methods = useForm<AgentApplicationValues>({
    resolver: zodResolver(agentApplicationSchema),
    defaultValues,
  });

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
    else router.back();
  }

  async function handleNext() {
    const valid = await methods.trigger(AGENT_STEP_FIELDS[step] ?? []);
    if (!valid) return;

    setError('');
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    try {
      const values = methods.getValues();
      const formData = new FormData();
      formData.set('display_name', values.display_name.trim());
      formData.set('phone_number', values.phone_number.trim());
      formData.set('operating_area', values.operating_areas.join(', '));
      formData.set('bio', values.bio.trim());

      const res = await fetch('/api/agent/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit your application');

      toast.success('Application submitted', {
        description: 'We will review it and get back to you shortly.',
        position: 'top-center',
      });
      requestPageLoader();
      router.push('/agent/status');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your application');
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AgentApplyHeader step={step} onBack={handleBack} />

      <div className="border-b border-border bg-card">
        <AgentStepBar current={step} />
      </div>

      {step === 0 && <EarnBanner />}

      <FormProvider {...methods}>
        <div className="flex flex-col gap-4 px-4 pt-5">
          {step === 0 && <AboutYouStep />}
          {step === 1 && <AreasBioStep />}

          {error && <FormError message={error} />}

          {step < LAST_STEP ? (
            <button type="button" onClick={handleNext} className={cn(primaryButtonClass, 'mt-2')}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className={cn(primaryButtonClass, 'mt-2')}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Submitting application…
                </span>
              ) : (
                'Submit application'
              )}
            </button>
          )}
        </div>
      </FormProvider>
    </div>
  );
}