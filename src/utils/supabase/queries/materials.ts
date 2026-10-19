import { createClient } from "../client";
import { createAdminClient } from "@/utils/supabase/admin";

export async function getMaterials({
  level,
  semester,
  type,
  search,
  limit = 20,
  offset = 0,
  ids,
  supabase: supabaseProp,
}: {
  level?: number;
  semester?: number;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
  supabase?: any;
  ids?: string[]; // Optional array of material IDs to filter by
}) {
  const supabase = supabaseProp || createClient();

  const courseInner = level || semester ? "!inner" : "";

  let query = supabase
    .from("materials")
    .select(
      `
      *,
      courses${courseInner} (
        course_code,
        course_title,
        level,
        semester
      )
    `,
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (level) {
    query = query.eq("courses.level", level);
  }

  if (semester) {
    query = query.eq("courses.semester", semester);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (ids) {
    query = query.in("id", ids);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getMaterialById(id: string, supabaseProp?: any) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("materials")
    .select(
      `
      *,
      courses (
        course_code,
        course_title,
        level,
        semester
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export type MaterialCounterColumn = "view_count" | "download_count";

const MAX_CAS_ATTEMPTS = 4;

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function incrementMaterialCount(
  materialId: string,
  column: MaterialCounterColumn,
) {
  const supabase = createAdminClient();

  // Read-modify-write guarded by a compare-and-set on the previous value, so
  // concurrent downloads can never overwrite each other. If another request
  // incremented the row in between, the update matches 0 rows and we retry
  // with the fresh value.
  for (let attempt = 1; attempt <= MAX_CAS_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from("materials")
      .select(column)
      .eq("id", materialId)
      .single();

    if (error) throw error;

    const row = data as Record<string, number | null> | null;
    const raw = row?.[column] ?? null;
    const casFilter =
      raw === null ? `${column}.is.null` : `${column}.eq.${raw}`;

    const { data: updated, error: updateError } = await supabase
      .from("materials")
      .update({ [column]: (raw ?? 0) + 1 })
      .eq("id", materialId)
      .or(casFilter)
      .select("id");

    if (updateError) throw updateError;
    if (updated && updated.length === 1) return;
  }

  throw new Error(
    `Failed to increment ${column} for material ${materialId} after ${MAX_CAS_ATTEMPTS} attempts`,
  );
}

async function bumpProfileDownloadCounters(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  for (let attempt = 1; attempt <= MAX_CAS_ATTEMPTS; attempt++) {
    const { data: profile, error } = await admin
      .from("profiles")
      .select("total_downloads, daily_download_count, daily_download_reset_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const rawTotal = profile.total_downloads as number | null;
    const now = new Date();
    const lastReset = profile.daily_download_reset_at
      ? new Date(profile.daily_download_reset_at).getTime()
      : null;
    const needsReset =
      lastReset === null ||
      Number.isNaN(lastReset) ||
      lastReset < startOfUtcDay(now);

    const casFilter =
      rawTotal === null ? "total_downloads.is.null" : `total_downloads.eq.${rawTotal}`;

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({
        total_downloads: (rawTotal ?? 0) + 1,
        daily_download_count: needsReset
          ? 1
          : (profile.daily_download_count ?? 0) + 1,
        ...(needsReset ? { daily_download_reset_at: now.toISOString() } : {}),
      })
      .eq("id", userId)
      .or(casFilter)
      .select("id");

    if (updateError) throw updateError;
    if (updated && updated.length === 1) return;
  }

  throw new Error(
    `Failed to update profile download counters for user ${userId} after ${MAX_CAS_ATTEMPTS} attempts`,
  );
}

export async function logMaterialAccess(
  materialId: string,
  userId: string,
  action: "view" | "download",
  meta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("material_access_logs").insert({
    material_id: materialId,
    user_id: userId,
    action,
    ip_address: meta?.ipAddress ?? null,
    user_agent: meta?.userAgent ?? null,
  });

  if (error) throw error;
}

export async function recordMaterialDownload(
  materialId: string,
  userId: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null },
): Promise<{ counted: boolean }> {
  const admin = createAdminClient();

  // Dedup: count a given user's download of a material at most once per UTC
  // day. Every access is still logged below for audit purposes.
  const dayStartIso = new Date(startOfUtcDay(new Date())).toISOString();

  const { data: existing, error: checkError } = await admin
    .from("material_access_logs")
    .select("id")
    .eq("material_id", materialId)
    .eq("user_id", userId)
    .eq("action", "download")
    .gte("created_at", dayStartIso)
    .limit(1);

  if (checkError) throw checkError;

  const counted = !existing || existing.length === 0;

  if (counted) {
    await incrementMaterialCount(materialId, "download_count");
    await bumpProfileDownloadCounters(admin, userId);
  }

  try {
    await logMaterialAccess(materialId, userId, "download", meta);
  } catch (logError) {
    console.error("Failed to log material download access:", logError);
  }

  return { counted };
}
