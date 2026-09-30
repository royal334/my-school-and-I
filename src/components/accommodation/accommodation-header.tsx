import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccommodationHeader({ hasSubmissions }: { hasSubmissions: boolean }) {
  return (
    <div
      className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      data-tour="page-accommodation"
    >
      <div>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Accommodation
        </h1>
        <p className="text-muted-foreground">
          Verified student housing near campus
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/dashboard/accommodation/submit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Know a vacancy?
          </Button>
        </Link>
        {hasSubmissions && (
          <Link href="/dashboard/accommodation/my-submissions">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              My Submissions
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}