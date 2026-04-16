import { createClient } from "../client";

export async function getAnnouncements(userLevel?: number) {
  const supabase = createClient();

  let query = supabase
    .from("announcements")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  // Filter by user level on client side (RLS handles security)
  if (userLevel) {
    return data.filter(
      (announcement) =>
        !announcement.target_levels ||
        announcement.target_levels.length === 0 ||
        announcement.target_levels.includes(userLevel),
    );
  }

  return data;
}
