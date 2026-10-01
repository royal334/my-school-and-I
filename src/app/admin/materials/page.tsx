import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin, getCourses } from '@/utils/supabase/queries';
import { AdminMaterialsDashboard } from '@/components/admin/materials/admin-materials-dashboard';
import { isAdminMaterialsTab } from '@/components/admin/materials/constants';

export const metadata = {
  title: 'Admin · Materials',
};

export default async function AdminMaterialsPage({
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
  const courses = await getCourses({}, supabase);

  return (
    <AdminMaterialsDashboard
      initialTab={isAdminMaterialsTab(tab) ? tab : 'overview'}
      courses={courses ?? []}
    />
  );
}
