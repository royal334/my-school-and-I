import NotificationFeed from '@/components/notifications/notification-feed';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div className="min-h-screen py-8">
      <div>
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with alerts for announcements, vendor updates, and more
          </p>
        </div>
        <div data-tour="page-notifications">
          <NotificationFeed />
        </div>
      </div>
    </div>
  );
}
