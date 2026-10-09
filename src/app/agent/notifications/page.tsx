import NotificationFeed from '@/components/notifications/notification-feed';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link'

export const metadata = {
  title: 'Notifications',
};

export default async function NotificationsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div>
        <div className="mb-2 flex gap-3">
            <Link href="/agent" className="mb-8 flex items-center gap-3">
              <button
                type="button"
                aria-label="Go back"
                className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="size-4.5 text-black" aria-hidden />
              </button>
            </Link>
          <div className="mb-4 md:mb-8">
            <h1 className="text-xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with alerts for announcements, vendor updates, and more
            </p>
          </div>
        </div>
        <div data-tour="page-notifications">
          <NotificationFeed />
        </div>
      </div>
    </div>
  );
}
