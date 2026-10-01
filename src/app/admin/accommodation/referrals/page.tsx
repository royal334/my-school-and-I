import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { ReferralsDashboard } from '@/components/admin/accommodation/referrals-dashboard';

export const metadata = {
  title: 'Admin · Referral rewards',
};

export default async function AdminReferralsPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  return <ReferralsDashboard />;
}
