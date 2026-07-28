import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  // Fetch announcement
  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')  
    .single();

  if (!announcement) {
    notFound();
  }

  const authorId = announcement.sender_id || announcement.author_id;
  let author = null;

  if (authorId) {
    const [{ data: profile }, { data: roleRow }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', authorId).maybeSingle(),
      supabase.from('admin_roles').select('role').eq('user_id', authorId).maybeSingle(),
    ]);

    author = {
      full_name: profile?.full_name || 'Unknown author',
      role: roleRow ? { role: roleRow.role } : null,
    };
  }

  let faculty = null;
  let department = null;

  if (announcement.faculty_id) {
    const { data: facultyData } = await supabase
      .from('faculties')
      .select('id, name')
      .eq('id', announcement.faculty_id)
      .maybeSingle();

    faculty = facultyData;
  }

  if (announcement.department_id) {
    const { data: departmentData } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', announcement.department_id)
      .maybeSingle();

    department = departmentData;
  }

  const facultyName = faculty?.name || 'selected faculty';
  const departmentName = department?.name || 'selected department';
  const levelLabel = announcement.level ? `${announcement.level}` : 'selected level';
  const authorRoleLabel = author?.role?.role || announcement.sender_role;

  // Mark as read if user is logged in
  if (user) {
    await supabase.from('announcement_reads').insert({
      announcement_id: id,
      user_id: user.id,
    });
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'important':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link href="/dashboard/announcements">
          <Button variant="ghost" size="sm" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Announcements
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getPriorityColor(announcement.priority)}>
              {announcement.priority.toUpperCase()}
            </Badge>
            {announcement.category && <Badge>{announcement.category}</Badge>}
            <Badge variant="outline">{announcement.type}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-3xl font-bold text-slate-900">
            {announcement.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pb-6 border-b">
            <span className="font-medium text-slate-900">
              {author?.full_name}
            </span>
            {authorRoleLabel && (
              <>
                <span>•</span>
                <span className="capitalize">
                  {authorRoleLabel.replace(/_/g, ' ')}
                </span>
              </>
            )}
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(announcement.published_at), {
                addSuffix: true,
              })}
            </span>
            {announcement.expires_at && (
              <>
                <span>•</span>
                <span className="text-orange-600">
                  Expires{' '}
                  {formatDistanceToNow(new Date(announcement.expires_at))}
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {announcement.content}
            </div>
          </div>

          {/* Audience info */}
          <div className="bg-slate-50 p-4 rounded-lg text-sm">
            <p className="text-slate-600">
              <strong>Reaches:</strong>{' '}
              {announcement.target_scope === 'general'
                ? 'All students'
                : announcement.target_scope === 'faculty'
                ? `All ${facultyName} students`
                : announcement.target_scope === 'department'
                ? `All ${departmentName} students`
                : `${levelLabel}-level in ${departmentName}`}
            </p>
          </div>

          {/* Save button */}
          {user && (
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}