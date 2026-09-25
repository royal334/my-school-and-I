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
      borderBottom: '0.5px solid #D6E5DF',
    }}>
      <span style={{ fontSize: 14, color: 'var(--text-primary, #141F1B)' }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? 'var(--color-success, #1A7A52)' : 'var(--text-secondary, #6B7B75)',
      }}>
        {isBoolean ? (value ? 'Yes' : 'No') : value}
        {detail && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}> ({detail})</span>}
      </span>
    </div>
  );
}

export function FacilityList({ listing }: { listing: Listing }) {
  return (
    <div style={{
      background: 'var(--surface-card, #FFFFFF)',
      border: '0.5px solid #D6E5DF',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 16,
      marginBottom: 12,
    }}>
      <h3 style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-sage, #4A8C73)',
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
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
          {listing.facilities_notes}
        </p>
      )}
    </div>
  );
}