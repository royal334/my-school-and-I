import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccommodationHeader({ hasSubmissions }: { hasSubmissions: boolean }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Accommodation
        </h1>
        <p className="text-[#6B7B75] dark:text-[#9BA19E]">
          Verified student housing near campus
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/dashboard/accommodation/submit">
          <Button className="bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
            <Plus className="mr-2 h-4 w-4" />
            Know a vacancy?
          </Button>
        </Link>
        {hasSubmissions && (
          <Link href="/dashboard/accommodation/my-submissions">
            <Button className="bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
              <ClipboardList className="mr-2 h-4 w-4" />
              My Submissions
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}