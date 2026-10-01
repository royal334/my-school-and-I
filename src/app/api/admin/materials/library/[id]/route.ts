// app/api/admin/materials/library/[id]/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';

const MATERIALS_BUCKET = 'materials';

// PATCH /api/admin/materials/library/:id  { action: 'publish' | 'unpublish' | 'delete' }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isUserAdmin(user.id, supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action } = body;
  if (!['publish', 'unpublish', 'delete'].includes(action ?? '')) {
    return NextResponse.json(
      { error: 'Action must be "publish", "unpublish" or "delete"' },
      { status: 400 },
    );
  }

  try {
    const { data: material, error: loadError } = await supabase
      .from('materials')
      .select('id, file_path, title, is_approved')
      .eq('id', id)
      .single();

    if (loadError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabase.from('materials').delete().eq('id', id);
      if (deleteError) throw deleteError;

      // The row is gone, so a failed file cleanup must not fail the request.
      if (material.file_path) {
        await supabase.storage.from(MATERIALS_BUCKET).remove([material.file_path]);
      }

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'material_deleted',
        resource_type: 'material',
        resource_id: id,
        metadata: { title: material.title },
      });

      return NextResponse.json({ success: true, deleted: true });
    }

    const publishing = action === 'publish';

    const { data: updated, error: updateError } = await supabase
      .from('materials')
      .update(
        publishing
          ? {
              is_approved: true,
              approved_by: user.id,
              approved_at: new Date().toISOString(),
            }
          : { is_approved: false },
      )
      .eq('id', id)
      .select(
        `
        *,
        course:courses (id, course_code, course_title, level, semester),
        uploader:profiles!materials_uploaded_by_fkey (id, full_name, matric_number)
      `,
      )
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, material: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
