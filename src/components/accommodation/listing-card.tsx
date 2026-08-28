import Link from 'next/link';
import { VerifiedBadge } from '@/components/accommodation/verified-badge';
import { FacilityChip } from '@/components/accommodation/facility-chip';
import type { Listing } from '@/components/accommodation/types';

export function ListingCard({ listing }: { listing: Listing }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);

  return (
    <Link href={`/dashboard/accommodation/${listing.id}`} className="block">
      <div className="group h-full overflow-hidden rounded-xl border border-[#D6E5DF] bg-card text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4A8C73]/40 hover:shadow-md dark:border-white/10 dark:hover:border-[#7EC8A0]/40">
        {/* Image */}
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#E8F5EF] dark:bg-[#1E211F]">
          {listing.cover_image ? (
            <img
              src={listing.cover_image.file_path}
              alt={listing.property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="9" width="18" height="13" rx="2" stroke="#4A8C73" strokeWidth="1.5" />
              <path d="M9 9V7a3 3 0 016 0v2" stroke="#4A8C73" strokeWidth="1.5" />
              <path d="M3 13h18" stroke="#4A8C73" strokeWidth="1.5" />
            </svg>
          )}

          {/* Room type badge */}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#E8F5EF]/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#1A3C34] dark:bg-[#0F1110]/70 dark:text-[#E1E4E2]">
            {listing.room_type}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Verified badge */}
          {listing.last_verified_at && (
            <div className="mb-2">
              <VerifiedBadge verifiedAt={listing.last_verified_at} />
            </div>
          )}

          {/* Property name */}
          <h3 className="text-base leading-tight tracking-tight">
            {listing.property.name}
          </h3>

          {/* Location */}
          <p className="mt-1 mb-2.5 text-xs text-[#6B7B75] dark:text-[#9BA19E]">
            📍 {listing.property.area}
            {listing.property.landmark && ` · Near ${listing.property.landmark}`}
          </p>

          {/* Facilities */}
          <div className="mb-3 flex flex-wrap gap-1">
            <FacilityChip label="Water" active={listing.has_water} />
            <FacilityChip label="Electricity" active={listing.has_electricity} />
            <FacilityChip label="Security" active={listing.has_security} />
            <FacilityChip label="Furnished" active={listing.is_furnished} />
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono text-[17px] font-medium text-[#1A3C34] dark:text-[#ECEEED]">
                {formatPrice(listing.price)}
              </span>
              <span className="ml-1 text-[11px] text-[#6B7B75] dark:text-[#9BA19E]">/yr</span>
            </div>
            <span className="text-xs font-medium text-[#4A8C73] dark:text-[#7EC8A0]">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}