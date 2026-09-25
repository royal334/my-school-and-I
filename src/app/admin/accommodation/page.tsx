import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { AccommodationDashboard } from '@/components/admin/accommodation/dashboard';
import { getAdminAccommodationDashboard } from '@/utils/supabase/queries/accommodation-admin';
import { isTab } from '@/components/admin/accommodation/types';

export const metadata = {
  title: 'Admin · Accommodation',
};

export default async function AdminAccommodationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  const { tab } = await searchParams;
  const initialData = await getAdminAccommodationDashboard(supabase);

  return <AccommodationDashboard initialData={initialData} initialTab={isTab(tab) ? tab : 'overview'} />;
}