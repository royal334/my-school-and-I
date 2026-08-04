import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';

const USER_CONTEXT_REVALIDATE = 15 * 60; // 15 minutes

async function fetchUserContext(userId: string) {
  const supabase = createAdminClient();

  const [{ data: profile, error: profileError }, { data: roleRow, error: roleError }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

  if (profileError) throw profileError;
  if (roleError) throw roleError;

  return { profile, role: roleRow?.role ?? null };
}

/**
 * Cached user context (profile + admin role), keyed by userId.
 * Revalidates every 15 minutes. Profile fields fetched separately, not via a
 * join, per the schema note in AGENTS.md.
 */
export const getCachedUserContext = unstable_cache(
  fetchUserContext,
  ['user-context'],
  { revalidate: USER_CONTEXT_REVALIDATE },
);
