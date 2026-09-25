import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UnitVerification } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';

export function VerificationHistoryCard({ verifications }: { verifications: UnitVerification[] }) {
  if (!verifications || verifications.length === 0) return null;

  return (
    <Card>
      <SectionTitle>Verification history</SectionTitle>
      <div className="mt-1 flex flex-col gap-2">
        {verifications.map(v => {
          const approved = v.verification_result === 'approved';
          return (
            <div
              key={v.id}
              className={cn(
                'rounded-lg border px-3 py-2.5',
                approved ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5',
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={cn('text-xs font-medium capitalize', approved ? 'text-success' : 'text-error')}>
                  {approved ? '✓' : '✕'} {v.verification_result}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-300">
                  {format(new Date(v.verified_at), 'MMM d, yyyy')}
                </span>
              </div>
              {v.notes && (
                <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-300">{v.notes}</p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[
                  { label: 'Location', val: v.location_confirmed },
                  { label: 'Owner', val: v.owner_confirmed },
                  { label: 'Price', val: v.price_confirmed },
                  { label: 'Availability', val: v.availability_confirmed },
                  { label: 'Photos', val: v.photos_confirmed },
                  { label: 'Facilities', val: v.facilities_confirmed },
                ].map(({ label, val }) => val ? (
                  <span
                    key={label}
                    className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] text-success"
                  >
                    ✓ {label}
                  </span>
                ) : null)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}