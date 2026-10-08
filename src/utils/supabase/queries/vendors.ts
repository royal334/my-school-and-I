import { createClient } from "../client";

export async function getVendors(filters: {
  category?: string;
  search?: string;
  services?:string[];
  minRating?: number;
  verifiedOnly?: boolean;
  featured_only?: boolean;
  limit?: number;
  supabaseProp?:any;
  throwOnError?: boolean;
}) {
  const supabase =  filters.supabaseProp || createClient()

  let query = supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        id,
        name,
        emoji
      ),
      profiles (
        full_name,
        avatar_url
      )
    `,
    )
    .eq("is_approved", true);

  // Category filter
  if (filters.category && filters.category !== "all") {
    query = query.eq("category_id", filters.category);
  }

  // Search filter (full-text search)
  if (filters.search) {
    query = query.or(
      `business_name.ilike.%${filters.search}%,` +
        `description.ilike.%${filters.search}%,` +
        `services.cs.{${filters.search}}`,
    );
  }

  // Services filter
  if (filters.services && filters.services.length > 0) {
    query = query.contains("services", filters.services);
  }

    // Featured first, then by rating
    if (filters.featured_only) {
      query = query.eq("subscription_tier", 'featured');
    }

  // Verified only
  if (filters.verifiedOnly) {
    query = query.eq("is_verified", true);
  }

  // Limit
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    if (filters.throwOnError) throw error;
    console.error("Get vendors error:", error);
    return [];
  }

  let filteredData = [...(data || [])];

  if (filters.search) {
    const normalizedSearch = filters.search.toLowerCase().trim();
    filteredData = filteredData.filter((vendor: any) => {
      const businessName = vendor.business_name?.toLowerCase() || "";
      const description = vendor.description?.toLowerCase() || "";
      const servicesText = Array.isArray(vendor.services)
        ? vendor.services.join(" ").toLowerCase()
        : "";

      return (
        businessName.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        servicesText.includes(normalizedSearch)
      );
    });
  }

  // Tier order only — VendorDirectory shuffles within each tier after fetching.
  const tierPriority: Record<string, number> = {
    featured: 1,
    premium: 2,
    basic: 3,
  };

  return filteredData.sort((a: any, b: any) => {
    const priorityA = tierPriority[a.subscription_tier] || 4;
    const priorityB = tierPriority[b.subscription_tier] || 4;
    return priorityA - priorityB;
  });
}

export async function getVendorById(id: string, supabaseProp?: any) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        name,
        emoji
      ),
      profiles (
        full_name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getVendorReviews(
  vendorId: string,
  limit: number = 10,
  supabaseProp?: any,
) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("vendor_reviews")
    .select(
      `
      *,
      profiles (
        full_name
      )
    `,
    )
    .eq("vendor_id", vendorId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getUserVendorReview(
  vendorId: string,
  userId: string,
  supabaseProp?: any,
) {
  const supabase = supabaseProp || createClient();

  const { data, error } = await supabase
    .from("vendor_reviews")
    .select("id")
    .eq("vendor_id", vendorId)
    .eq("user_id", userId)
    .single();

  if (error) return null;
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
      is_approved: true, // Requires moderator approval
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
