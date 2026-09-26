import { formatDistanceToNow } from 'date-fns';
import type { Verification } from '@/components/accommodation/types';

interface VerifiedChecklistProps {
  verification: Verification;
}

export function VerifiedChecklist({ verification }: VerifiedChecklistProps) {
  const checks = [
    { label: 'Location confirmed', value: verification.location_confirmed },
    { label: 'Owner/caretaker verified', value: verification.owner_confirmed },
    { label: 'Price confirmed', value: verification.price_confirmed },
    { label: 'Availability confirmed', value: verification.availability_confirmed },
    { label: 'Photos verified', value: verification.photos_confirmed },
    { label: 'Facilities checked', value: verification.facilities_confirmed },
  ];

  return (
    <div style={{
      border: '1px solid color-mix(in oklab, var(--success) 25%, transparent)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)' }}>
          ✓ CampusHub Verified
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
          {formatDistanceToNow(new Date(verification.verified_at), { addSuffix: true })}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checks.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: value ? 'var(--success-text)' : 'var(--muted-foreground)' }}>
              {value ? '✓' : '○'}
            </span>
            <span style={{ fontSize: 13, color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}