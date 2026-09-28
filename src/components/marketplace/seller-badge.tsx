interface SellerBadgeProps {
  type: 'student' | 'vendor';
  /** Vendors get a "verified" suffix on the detail page. */
  verified?: boolean;
}

export function SellerBadge({ type, verified = false }: SellerBadgeProps) {
  const isVendor = type === 'vendor';

  return (
    <span
      className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
        isVendor
          ? 'bg-accent-500/10 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400'
          : 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
      }`}
    >
      {isVendor ? (verified ? '✓ Verified Vendor' : '✓ Vendor') : 'Student Seller'}
    </span>
  );
}