// app/api/admin/materials/submissions/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';

// GET /api/admin/materials/submissions?status=pending
export async function GET(request: Request) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isUserAdmin(user.id, supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = new URL(request.url).searchParams.get('status') || '';

  try {
    let query = supabase
      .from('material_submissions')
      .select(`
        *,
        faculty:faculties (id, name),
        department:departments (id, name)
      `)
      .order('submitted_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const submissions = data ?? [];
    const userIds = [
      ...new Set(
        submissions
          .map((submission) => submission.user_id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    ];

    const { data: profiles, error: profilesError } = userIds.length
      ? await supabase
          .from('profiles')
          .select('id, full_name, matric_number')
          .in('id', userIds)
      : { data: [], error: null };

    if (profilesError) throw profilesError;

    const profilesById = Object.fromEntries(
      (profiles || []).map((profile) => [profile.id, profile]),
    );

    return NextResponse.json({
      submissions: submissions.map((submission) => ({
        ...submission,
        submitter: profilesById[submission.user_id] || null,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
