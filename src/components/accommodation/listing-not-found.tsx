import Link from 'next/link';

export function ListingNotFound() {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Listing not found or no longer available.</p>
      <Link href="/dashboard/accommodation">
        <button style={{ marginTop: 16, padding: '10px 20px', background: 'var(--color-forest)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Browse listings
        </button>
      </Link>
    </div>
  );
}