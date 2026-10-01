import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { AdminHome } from '@/components/admin/admin-home/admin-home';

export const metadata = {
  title: 'Admin | Campus&Me',
};

export default async function AdminPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  return <AdminHome />;
}
