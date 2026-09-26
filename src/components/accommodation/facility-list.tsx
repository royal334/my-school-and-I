import type { Listing } from '@/components/accommodation/types';

function FacilityRow({ label, value, detail }: { label: string; value: boolean | string; detail?: string }) {
  const isBoolean = typeof value === 'boolean';
  const isActive = isBoolean ? value : !!value;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 14, color: 'var(--foreground)' }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
      }}>
        {isBoolean ? (value ? 'Yes' : 'No') : value}
        {detail && <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}> ({detail})</span>}
      </span>
    </div>
  );
}

export function FacilityList({ listing }: { listing: Listing }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 16,
      marginBottom: 12,
    }}>
      <h3 style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--primary)',
        marginBottom: 4,
      }}>
        Facilities
      </h3>
      <FacilityRow label="Water" value={listing.has_water} />
      <FacilityRow label="Electricity" value={listing.has_electricity} />
      <FacilityRow label="Security" value={listing.has_security} />
      <FacilityRow label="Parking" value={listing.has_parking} />
      <FacilityRow label="Furnished" value={listing.is_furnished} />
      {listing.toilet_bathroom && (
        <FacilityRow label="Toilet/Bathroom" value={listing.toilet_bathroom} />
      )}
      {listing.facilities_notes && (
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 10, lineHeight: 1.6 }}>
          {listing.facilities_notes}
        </p>
      )}
    </div>
  );
}