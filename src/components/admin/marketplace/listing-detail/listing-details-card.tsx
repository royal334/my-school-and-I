'use client';

import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/components/marketplace/format';
import { getConditionLabel } from '@/components/marketplace/constants';
import { Panel } from '../panel';
import { SectionTitle } from '../section-title';
import { InfoRow } from '../info-row';
import type { AdminListingDetail } from '../types';

export function ListingDetailsCard({ listing }: { listing: AdminListingDetail }) {
  return (
    <Panel>
      <SectionTitle>Listing details</SectionTitle>

      <InfoRow label="Price" value={listing.price ? formatPrice(listing.price) : null} />
      <InfoRow
        label="Negotiable"
        value={listing.negotiable ? 'Yes' : 'No'}
        tone={listing.negotiable ? 'text-success-text' : undefined}
      />
      <InfoRow label="Condition" value={getConditionLabel(listing.condition)} />
      <InfoRow label="Category" value={listing.category} />
      <InfoRow label="Location" value={listing.location} />
      <InfoRow label="Views" value={listing.views} />
      <InfoRow label="Saves" value={listing.saves_count} />
      <InfoRow
        label="Boosted"
        value={listing.is_boosted ? 'Yes 🔥' : 'No'}
        tone={listing.is_boosted ? 'text-accent-700 dark:text-accent-400' : undefined}
      />
      <InfoRow
        label="Urgent"
        value={listing.is_urgent ? 'Yes ⚡' : 'No'}
        tone={listing.is_urgent ? 'text-warning-text' : undefined}
      />
      <InfoRow
        label="Listed"
        value={formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
      />

      {listing.description && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-1.5 text-xs text-muted-foreground">Description</p>
          <p className="text-[13px] leading-relaxed whitespace-pre-line text-foreground">
            {listing.description}
          </p>
        </div>
      )}
    </Panel>
  );
}
