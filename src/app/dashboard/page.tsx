import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserSemesters } from '@/utils/supabase/queries';
import { calculateCGPAFromSemesters } from '@/utils/lib/cgpa-helpers';
import { Badge } from '@/components/ui/badge';
import {
  DashboardWelcomeHeader,
  DashboardSubscriptionBanner,
  DashboardQuickStats,
  DashboardQuickActions,
  DashboardRecentAnnouncements,
  DashboardProfileSection,
} from '@/components/dashboard';

export const metadata = {
  title: 'Dashboard | UniHub',
};

export default async function DashboardPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get user statistics
  const { count: materialsCount } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true);

  const { count: vendorsCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true);

  // Get user's CGPA (same as CGPA page: cumulative over all semesters)
  const semesters = await getUserSemesters(user.id, supabase);
  const cgpaResult =
    semesters && semesters.length > 0
      ? calculateCGPAFromSemesters(semesters)
      : null;
  const currentGPA = cgpaResult?.cgpa ?? null;

  // Get recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, type, created_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(3);

  // Check subscription status
  const hasActiveSubscription =
    profile?.subscription_status === 'active' &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader fullName={profile?.full_name} />

      {!hasActiveSubscription && <DashboardSubscriptionBanner />}

      <DashboardQuickStats
        currentGPA={currentGPA}
        materialsCount={materialsCount || 0}
        vendorsCount={vendorsCount || 0}
        dailyDownloadCount={profile?.daily_download_count || 0}
      />

      <DashboardQuickActions />

      <DashboardRecentAnnouncements announcements={announcements || []} />

      <DashboardProfileSection
        profile={profile}
        hasActiveSubscription={hasActiveSubscription}
        currentGPA={currentGPA}
      />
    </div>
  );
}