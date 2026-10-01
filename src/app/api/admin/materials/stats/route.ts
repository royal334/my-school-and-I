// app/api/admin/materials/stats/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import type { AdminMaterialsStats } from '@/components/admin/materials/types';

// GET /api/admin/materials/stats
export async function GET() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isUserAdmin(user.id, supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Read once, unfiltered, and aggregate here so the tiles describe the whole
    // library rather than whatever filter a tab happens to have applied.
    const [submissionsResult, materialsResult] = await Promise.all([
      supabase.from('material_submissions').select('status'),
      supabase.from('materials').select('is_approved, download_count'),
    ]);

    if (submissionsResult.error) throw submissionsResult.error;
    if (materialsResult.error) throw materialsResult.error;

    const submissions = submissionsResult.data ?? [];
    const materials = materialsResult.data ?? [];

    const countBy = <T,>(rows: T[], key: keyof T, value: unknown) =>
      rows.filter((row) => row[key] === value).length;

    const stats: AdminMaterialsStats = {
      pending_submissions: countBy(submissions, 'status', 'pending'),
      approved_submissions: countBy(submissions, 'status', 'approved'),
      rejected_submissions: countBy(submissions, 'status', 'rejected'),
      published_materials: countBy(materials, 'is_approved', true),
      unpublished_materials: countBy(materials, 'is_approved', false),
      total_downloads: materials.reduce(
        (sum, row) => sum + (row.download_count ?? 0),
        0,
      ),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
