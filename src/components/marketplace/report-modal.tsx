'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REPORT_REASONS } from '@/components/marketplace/constants';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  listingId: string;
  onClose: () => void;
}

export function ReportModal({ listingId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, reason, details }),
      });
      if (!res.ok) throw new Error('Request failed');
      setDone(true);
    } catch {
      toast.error('Could not submit your report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Report listing"
        className="max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl"
      >
        {done ? (
          <div className="py-5 text-center">
            <p className="mb-2.5 text-2xl">✅</p>
            <p className="text-[15px] font-medium text-foreground">Report submitted</p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Our team will review this listing.
            </p>
            <Button className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-foreground">Report listing</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-3 flex flex-col gap-2">
              {REPORT_REASONS.map((option) => {
                const active = reason === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setReason(option.key)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-colors',
                      active
                        ? 'border-error/30 bg-error-bg font-medium text-error-text'
                        : 'border-transparent bg-muted text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="mb-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] outline-none focus:border-primary-500"
            />

            <Button
              className="w-full"
              disabled={!reason || loading}
              onClick={submit}
            >
              {loading ? 'Submitting…' : 'Submit report'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}