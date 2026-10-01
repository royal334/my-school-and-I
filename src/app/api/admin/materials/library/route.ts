// app/api/admin/materials/library/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';

const SELECT = `
  *,
  course:courses (id, course_code, course_title, level, semester),
  uploader:profiles!materials_uploaded_by_fkey (id, full_name, matric_number)
`;

// GET /api/admin/materials/library?status=published
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
    let query = supabase.from('materials').select(SELECT).order('created_at', { ascending: false });

    if (status === 'published') query = query.eq('is_approved', true);
    if (status === 'unpublished') query = query.eq('is_approved', false);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ materials: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
