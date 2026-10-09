'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ID_TYPES } from '../constants';
import {
  choiceDotClass,
  choiceRowClass,
  FormError,
  primaryButtonClass,
} from '../apply/form-primitives';
import { DocUploadField } from '../apply/doc-upload-field';

export function IdentityVerificationCard() {
  const router = useRouter();
  const [idType, setIdType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!idType) {
      setError('Select an ID type.');
      return;
    }
    if (!file) {
      setError('Upload your ID document.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.set('id_type', idType);
      formData.set('id_document', file);

      const res = await fetch('/api/agent/profile/verification', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit your verification.');

      toast.success('Identity verification submitted', {
        description: 'We will review your document shortly.',
        position: 'top-center',
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your verification.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-warning/25 bg-warning-bg p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15">
          <ShieldAlert className="size-4.5 text-warning" aria-hidden />
        </span>
        <div>
          <h2 className="text-base tracking-tight text-foreground">
            Verify your identity to continue
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Submit a valid ID so we can finish reviewing your application and unlock property
            submissions. Your document is stored securely and never shared publicly.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">ID type</p>
          {ID_TYPES.map((type) => {
            const active = idType === type;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() => setIdType(type)}
                className={choiceRowClass(active)}
              >
                <span className={choiceDotClass(active)}>
                  {active && <Check className="size-2.5 text-primary-foreground" aria-hidden />}
                </span>
                {type}
              </button>
            );
          })}
        </div>

        {idType && (
          <DocUploadField label={`Upload your ${idType}`} file={file} onSelect={setFile} />
        )}

        {error && <FormError message={error} />}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !idType || !file}
          className={cn(primaryButtonClass, 'disabled:opacity-60')}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Submitting verification…
            </span>
          ) : (
            'Submit verification'
          )}
        </button>
      </div>
    </section>
  );
}
