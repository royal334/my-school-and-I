import { createClient } from "../client";
import { Database } from "../database.types";
import {
  calculateCGPAFromSemesters,
  getGradePoint,
} from "@/utils/lib/cgpa-helpers";

type Semester = Database["public"]["Tables"]["semesters"]["Row"];

export async function getUserSemesters(userId: string, supabaseProp?: any) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("semesters")
    .select(
      `
      *,
      semester_courses (*)
    `,
    )
    .eq("user_id", userId)
    .order("level", { ascending: true })
    .order("semester", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createSemester(
  semesterData: Database["public"]["Tables"]["semesters"]["Insert"],
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("semesters")
    .insert(semesterData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addCoursesToSemester(
  semesterId: string,
  courses: Database["public"]["Tables"]["semester_courses"]["Insert"][],
) {
  const supabase = createClient();

  const coursesWithSemesterId = courses.map((course) => ({
    ...course,
    semester_id: semesterId,
  }));

  const { data, error } = await supabase
    .from("semester_courses")
    .insert(coursesWithSemesterId)
    .select();

  if (error) throw error;

  // Calculate GPA for the semester
  await supabase.rpc("calculate_semester_gpa", { semester_uuid: semesterId });

  return data;
}

export async function calculateCGPA(userId: string): Promise<{
  cgpa: number;
  totalCreditUnits: number;
  semesters: Semester[];
}> {
  const semesters = await getUserSemesters(userId);
  const result = calculateCGPAFromSemesters(semesters);

  return {
    cgpa: result.cgpa,
    totalCreditUnits: result.totalUnits,
    semesters,
  };
}

export const calculateGradePoint = getGradePoint;
