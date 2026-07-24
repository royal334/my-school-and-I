import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnnouncementForm from '@/components/announcements/announcement-form';

export const metadata = {
  title: 'Create Announcement',
};

export default async function CreateAnnouncementPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminRoleRow, error: adminRoleError } = await supabase
  .from('admin_roles')
  .select('user_id, id, role')
  .eq('user_id', user.id)
  .maybeSingle();

if (adminRoleError) {
  console.log('admin_roles lookup failed:', adminRoleError);
  return;
}

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('role_id')
  .eq('id', user.id) // <-- key fix
  .single();

if (profileError) {
  console.log('profiles lookup failed:', profileError);
  return;
}


const canSend = [
    "super_admin",
  'admin',
  'faculty_president',
  'departmental_president',
  'course_rep',
  'department_admin',
  'student_union_rep'
].includes(adminRoleRow?.role|| '');

  if (!canSend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-slate-600 mt-2">
            You do not have permission to create announcements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            New Announcement
          </h1>
        </div>
        <AnnouncementForm />
      </div>
    </div>
  );
}