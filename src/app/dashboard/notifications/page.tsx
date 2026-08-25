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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div>
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
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
