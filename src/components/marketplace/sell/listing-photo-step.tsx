'use client';

import { ListingImageUploader } from '@/components/marketplace/sell/listing-image-uploader';

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
        {isEditing
          ? 'Add more photos to make your listing stand out. You can have up to 5 images in total.'
          : 'Photos help your listing sell faster. You can add up to 5 images.'}
      </p>
      <ListingImageUploader
        listingId={listingId}
        sellerId={sellerId}
        onUploaded={onUploaded}
        isEditing={isEditing}
      />
    </div>
  );
}