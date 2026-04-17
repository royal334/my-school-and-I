import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserSemesters } from '@/utils/supabase/queries';
import { calculateCGPAFromSemesters } from '@/utils/lib/cgpa-helpers';
import { StudentDashboard } from '@/components/dashboard';
import VendorDashboard from '@/components/dashboard/vendor-dashboard';

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

  // Get user's CGPA
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

    const isVendor = profile?.account_type === 'vendor';

    if (isVendor) {
      // Get vendor data
      const { data: vendor } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_categories (
            name,
            icon
          )
        `)
        .eq('owner_id', user.id)
        .single();
   
      return <VendorDashboard profile={profile} vendor={vendor} />;
    }

  return (
    <StudentDashboard
      profile={profile}
      materialsCount={materialsCount || 0}
      vendorsCount={vendorsCount || 0}
      currentGPA={currentGPA}
      announcements={announcements || []}
      hasActiveSubscription={hasActiveSubscription}
    />
  );
}