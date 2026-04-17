import { createClient } from "../client";
import { Database } from "../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(userId: string, supabaseProp?: any) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function hasActiveSubscription(
  userId: string,
  supabaseProp?: any,
): Promise<boolean> {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", userId)
    .single();

  if (error) return false;

  return (
    data.subscription_status === "active" &&
    data.subscription_expires_at &&
    new Date(data.subscription_expires_at) > new Date()
  );
}

export async function checkDailyDownloadLimit(userId: string): Promise<{
  canDownload: boolean;
  remainingDownloads: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("daily_download_count, daily_download_reset_at")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const DAILY_LIMIT = 10;
  const resetTime = new Date(data.daily_download_reset_at);
  const now = new Date();

  // Reset if more than 24 hours
  if (now.getTime() - resetTime.getTime() > 24 * 60 * 60 * 1000) {
    await supabase
      .from("profiles")
      .update({
        daily_download_count: 0,
        daily_download_reset_at: now.toISOString(),
      })
      .eq("id", userId);

    return {
      canDownload: true,
      remainingDownloads: DAILY_LIMIT,
    };
  }

  const remaining = DAILY_LIMIT - data.daily_download_count;

  return {
    canDownload: remaining > 0,
    remainingDownloads: Math.max(0, remaining),
  };
}

export async function incrementDailyDownloadCount(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("daily_download_count")
    .eq("id", userId)
    .single();

  if (error) throw error;

  await supabase
    .from("profiles")
    .update({
      daily_download_count: data.daily_download_count + 1,
      total_downloads: data.daily_download_count + 1,
    })
    .eq("id", userId);
}
