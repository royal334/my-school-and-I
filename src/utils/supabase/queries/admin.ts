import { createClient } from "../client";

export async function isUserAdmin(
  userId: string,
  supabaseProp?: any,
): Promise<boolean> {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) return false;

  return ["super_admin", "admin"].includes(data.role);
}

export async function isUserModerator(
  userId: string,
  supabaseProp?: any,
): Promise<boolean> {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) return false;

  return ["super_admin", "admin", "moderator"].includes(data.role);
}

export async function getPendingMaterials() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("materials")
    .select(
      `
      *,
      courses (
        course_code,
        course_title
      ),
      profiles!materials_uploaded_by_fkey (
        full_name,
        matric_number
      )
    `,
    )
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function approveMaterial(materialId: string, adminId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("materials")
    .update({
      is_approved: true,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", materialId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingVendors() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        name
      ),
      profiles!vendors_user_id_fkey (
        full_name,
        matric_number,
        email
      )
    `,
    )
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function approveVendor(vendorId: string, adminId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vendors")
    .update({
      is_approved: true,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", vendorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
