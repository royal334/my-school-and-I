import { formatDistanceToNow, format } from 'date-fns';
import type { Listing } from '@/components/accommodation/types';

export function PropertySummary({ listing }: { listing: Listing }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 16,
      marginBottom: 12,
    }}>
      {listing.last_verified_at && (
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--primary)',
            background: 'var(--secondary)',
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
        color: 'var(--foreground)',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        marginBottom: 6,
      }}>
        {listing.room_type}
      </h2>

      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 14 }}>
        📍 {listing.property.area}
        {listing.property.landmark && ` · Near ${listing.property.landmark}`}
      </p>

      {/* Price */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 24,
          fontWeight: 500,
          color: 'var(--foreground)',
        }}>
          {formatPrice(listing.price)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>/year</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
        All fees included (rent, service charge, utilities, etc.) unless otherwise stated.
      </p>

      {listing.additional_charges > 0 && (
        <p style={{ fontSize: 12, color: 'var(--warning-text)', marginTop: 4 }}>
          + {formatPrice(listing.additional_charges)} in additional charges
          {listing.additional_charges_note && ` (${listing.additional_charges_note})`}
        </p>
      )}

      {listing.available_from && (
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
          Available from {format(new Date(listing.available_from), 'MMMM yyyy')}
        </p>
      )}
    </div>
  );
}