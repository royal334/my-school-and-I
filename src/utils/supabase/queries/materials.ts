import { createClient } from "../client";
import { Database } from "../database.types";

export async function getMaterials({
  level,
  semester,
  type,
  search,
  limit = 20,
  offset = 0,
  supabase: supabaseProp,
}: {
  level?: number;
  semester?: number;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
  supabase?: any;
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
        semester,
        credit_units
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function incrementMaterialViewCount(materialId: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc("increment", {
    row_id: materialId,
    table_name: "materials",
    column_name: "view_count",
  });

  if (error) throw error;
}

export async function logMaterialAccess(
  materialId: string,
  userId: string,
  action: "view" | "download",
) {
  const supabase = createClient();

  const { error } = await supabase.from("material_access_logs").insert({
    material_id: materialId,
    user_id: userId,
    action,
    ip_address: null, // You'll get this from request headers
    user_agent: null, // You'll get this from request headers
  });

  if (error) throw error;
}
