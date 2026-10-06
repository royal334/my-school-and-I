'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/** Client island so the detail header itself can stay a server component. */
export function LeadBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="-ml-1 cursor-pointer rounded-lg p-1.5 text-primary-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
    >
      <ArrowLeft className="size-5" aria-hidden />
    </button>
  );
}