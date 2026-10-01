import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ReferralsHeader() {
  return (
    <header className="bg-primary-600 px-4 pt-4 pb-4 dark:bg-primary-800">
      <Link
        href="/admin/accommodation"
        className="mb-2 flex w-fit items-center gap-1.5 text-xs text-white/60 no-underline transition-colors hover:text-white/90"
      >
        <ArrowLeft className="size-3.5" />
        Back to accommodation
      </Link>
      <h1 className="font-display text-xl tracking-tight text-white">Referral rewards</h1>
      <p className="mt-0.5 text-xs text-primary-300">
        Review eligibility and pay out student referrals
      </p>
    </header>
  );
}
