// utils/supabase/queries.ts
// Helper functions for common database operations

import { createClient } from "./client";
import { Database } from "./database.types";
import {
  calculateCGPAFromSemesters,
  getGradePoint,
} from "@/utils/lib/cgpa-helpers";

type Material = Database["public"]["Tables"]["materials"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Semester = Database["public"]["Tables"]["semesters"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];

// ============================================================
// MATERIALS QUERIES
// ============================================================

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

// ============================================================
// USER/PROFILE QUERIES
// ============================================================

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

// ============================================================
// COURSES QUERIES
// ============================================================

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

// ============================================================
// CGPA CALCULATOR QUERIES
// ============================================================

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
// ============================================================
// VENDORS QUERIES
// ============================================================

export async function getVendors({
  categoryId,
  search,
  featured,
  limit = 20,
  offset = 0,
}: {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = createClient();

  let query = supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        name,
        icon
      )
    `,
    )
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,description.ilike.%${search}%`,
    );
  }

  if (featured !== undefined) {
    query = query.eq("is_featured", featured);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getVendorById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        name,
        icon
      ),
      vendor_reviews (
        id,
        rating,
        comment,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("id", id)
    .eq("vendor_reviews.is_approved", true)
    .single();

  if (error) throw error;
  return data;
}

export async function getVendorCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vendor_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createVendorReview(
  vendorId: string,
  userId: string,
  rating: number,
  comment?: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vendor_reviews")
    .insert({
      vendor_id: vendorId,
      user_id: userId,
      rating,
      comment: comment || null,
      is_approved: false, // Requires moderator approval
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// ANNOUNCEMENTS QUERIES
// ============================================================

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

// ============================================================
// PAYMENTS QUERIES
// ============================================================

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

// ============================================================
// ADMIN QUERIES
// ============================================================

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
