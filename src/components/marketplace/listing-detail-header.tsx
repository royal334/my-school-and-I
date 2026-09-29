import { BackButton } from '@/components/marketplace/back-button';
import { SaveButton } from '@/components/marketplace/save-button';

interface ListingDetailHeaderProps {
  title: string;
  listingId: string;
  saved: boolean;
}

export function ListingDetailHeader({ title, listingId, saved }: ListingDetailHeaderProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary p-3 dark:bg-primary-900">
      <BackButton />
      <h1 className="flex-1 truncate text-[17px] font-semibold tracking-tight text-white">
        {title}
      </h1>
      <div role="status">
        <SaveButton listingId={listingId} saved={saved} variant="header" />
      </div>
    </div>
  );
}