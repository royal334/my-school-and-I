import { createClient } from "../client";

export async function getCourses(
  {
    level,
    semester,
  }: {
    level?: number;
    semester?: number;
  } = {},
  supabaseProp?: any,
) {
  const supabase = supabaseProp || createClient();

  let query = supabase
    .from("courses")
    .select("*")
    .order("course_code", { ascending: true });

  if (level) {
    query = query.eq("level", level);
  }

  if (semester) {
    query = query.eq("semester", semester);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getCourseById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
