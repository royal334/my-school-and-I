'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader } from '@/components/accommodation/detail-header';
import { ImageGallery } from '@/components/accommodation/image-gallery';
import { PropertySummary } from '@/components/accommodation/property-summary';
import { VerifiedChecklist } from '@/components/accommodation/verified-checklist';
import { FacilityList } from '@/components/accommodation/facility-list';
import { ViewingForm } from '@/components/accommodation/viewing-form';
import { DetailSkeleton } from '@/components/accommodation/detail-skeleton';
import { ListingNotFound } from '@/components/accommodation/listing-not-found';
import type { Listing } from '@/components/accommodation/types';

export default function AccommodationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/accommodation/listings/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setListing(data.listing);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetch_();
  }, [params.id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!listing) {
    return <ListingNotFound />;
  }

  const media = listing.media || [];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: 80 }}>
      <DetailHeader name={listing.room_type} onBack={() => router.back()} />

      {/* Image gallery */}
      <ImageGallery media={media} name={listing.room_type} />

      <div style={{ padding: '16px' }}>
        {/* Title section */}
        <PropertySummary listing={listing} />

        {/* Verification checklist */}
        {listing.verification && (
          <div style={{ marginBottom: 12 }} >
            <VerifiedChecklist verification={listing.verification} />
          </div>
        )}

        {/* Facilities */}
        <FacilityList listing={listing} />

        {/* Viewing request form */}
        <ViewingForm listingId={listing.id} propertyId={listing.property.id} />

        {/* Disclaimer */}
        <p style={{
          fontSize: 11,
          color: 'var(--muted-foreground)',
          textAlign: 'center',
          marginTop: 16,
          lineHeight: 1.6,
          padding: '0 8px',
        }}>
          This listing was verified by CampusHub at the date shown above. Verification confirms conditions at that specific time — not permanently. Always inspect the property before committing to a tenancy.
        </p>
      </div>
    </div>
  );
}