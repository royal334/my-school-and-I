import { createClient } from "../client";

export async function createPayment(
  userId: string,
  type: "semester_subscription" | "vendor_listing" | "featured_listing",
  amount: number,
  reference: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      reference,
      amount,
      type,
      status: "pending",
      currency: "NGN",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(
  reference: string,
  status: "success" | "failed" | "cancelled",
  metadata?: any,
) {
  const supabase = createClient();

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "success") {
    updates.paid_at = new Date().toISOString();
  }

  if (metadata) {
    updates.metadata = metadata;
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("reference", reference)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPayments(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
