import { formatDistanceToNow, format } from 'date-fns';
import type { Listing } from '@/components/accommodation/types';

export function PropertySummary({ listing }: { listing: Listing }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);

  return (
    <div style={{
      background: 'var(--surface-card, #FFFFFF)',
      border: '0.5px solid #D6E5DF',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 16,
      marginBottom: 12,
    }}>
      {listing.last_verified_at && (
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-success, #1A7A52)',
            background: 'rgba(26,122,82,0.08)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 10px',
          }}>
            ✓ CampusHub Verified — {formatDistanceToNow(new Date(listing.last_verified_at), { addSuffix: true })}
          </span>
        </div>
      )}

      <h2 style={{
        fontFamily: 'var(--font-display, serif)',
        fontSize: 22,
        color: 'var(--color-forest, #1A3C34)',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        marginBottom: 6,
      }}>
        {listing.property.name}
        {listing.unit_number && (
          <span style={{ fontSize: 15, color: 'var(--color-sage)' }}> · {listing.unit_number}</span>
        )}
      </h2>

      <p style={{ fontSize: 13, color: 'var(--text-secondary, #6B7B75)', marginBottom: 14 }}>
        📍 {listing.property.area}
        {listing.property.street && ` · ${listing.property.street}`}
        {listing.property.landmark && ` · Near ${listing.property.landmark}`}
      </p>

      {/* Room type label */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-sage, #4A8C73)',
      }}>
        {listing.room_type}
      </span>

      {/* Price */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTop: '0.5px solid #D6E5DF',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 24,
          fontWeight: 500,
          color: 'var(--color-forest, #1A3C34)',
        }}>
          {formatPrice(listing.price)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/year</span>
      </div>

      {listing.additional_charges > 0 && (
        <p style={{ fontSize: 12, color: 'var(--color-warning, #E8A020)', marginTop: 4 }}>
          + {formatPrice(listing.additional_charges)} in additional charges
          {listing.additional_charges_note && ` (${listing.additional_charges_note})`}
        </p>
      )}

      {listing.available_from && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          Available from {format(new Date(listing.available_from), 'MMMM yyyy')}
        </p>
      )}
    </div>
  );
}