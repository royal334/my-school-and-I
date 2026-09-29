'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingImageUploader } from '@/components/marketplace/sell/listing-image-uploader';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

interface ListingPhotoStepProps {
  listingId: string | null;
  sellerId: string;
  isEditing: boolean;
  onUploaded: () => void;
}

export function ListingPhotoStep({
  listingId,
  sellerId,
  isEditing,
  onUploaded,
}: ListingPhotoStepProps) {
  if (isEditing) {
    return (
      <div>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          Your changes are saved. Manage the photos for this listing from its page.
        </p>
        <Button asChild className="w-full">
          <Link
            href={
              listingId
                ? `${MARKETPLACE_BASE_PATH}/${listingId}`
                : `${MARKETPLACE_BASE_PATH}/my-listings`
            }
          >
            <Eye />
            View listing
          </Link>
        </Button>
      </div>
    );
  }

  if (!listingId) {
    return (
      <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
        The listing could not be created. Go back and try again.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
        Photos help your listing sell faster. You can add up to 5 images.
      </p>
      <ListingImageUploader listingId={listingId} sellerId={sellerId} onUploaded={onUploaded} />
    </div>
  );
}