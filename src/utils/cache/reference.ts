import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';

const REFERENCE_REVALIDATE = 3 * 24 * 60 * 60; // 3 days

async function fetchFacultiesDepartments() {
  const supabase = createAdminClient();

  const [{ data: faculties, error: facultiesError }, { data: departments, error: departmentsError }] =
    await Promise.all([
      supabase.from('faculties').select('id, name').order('name'),
      supabase
        .from('departments')
        .select('id, name, faculty_id')
        .order('name'),
    ]);

  if (facultiesError) throw facultiesError;
  if (departmentsError) throw departmentsError;

  return { faculties: faculties || [], departments: departments || [] };
}

/**
 * Cached static reference data (faculties + departments). Revalidates every 3
 * days. Admin client is safe here because the data is public and read-only.
 */
export const getCachedFacultiesDepartments = unstable_cache(
  fetchFacultiesDepartments,
  ['faculties-departments'],
  { revalidate: REFERENCE_REVALIDATE },
);
