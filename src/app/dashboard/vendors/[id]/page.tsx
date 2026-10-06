import { createClient } from "@/utils/supabase/server";
import {
  getVendorById,
  getVendorReviews,
  getUserVendorReview,
} from "@/utils/supabase/queries";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import ContactButtons from "@/components/vendors/contact-buttons";
import ShareButton from "@/components/vendors/share-button";

// New Components
import VendorHeader from "@/components/vendors/vendor-header";
import VendorHero from "@/components/vendors/vendor-hero";
import VendorDetailsInfo from "@/components/vendors/vendor-details-info";
import VendorGallery from "@/components/vendors/vendor-gallery";
import VendorReviewsSection from "@/components/vendors/vendor-reviews-section";
import VendorOwnerStats from "@/components/vendors/vendor-owner-stats";
import { checkSubscriptionActive } from "@/utils/lib/vendor-features";
import VendorViewTracker from '@/components/vendors/vendor-view-tracker';

interface PageProps {
  params: Promise<{id: string;}>;
}

export default async function VendorDetailPage({ params }: PageProps) {
  const supabase = createClient(await cookies());
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get vendor details
  const vendor = await getVendorById(id, supabase);
  
  if (!vendor) {
    notFound();
  }

  const cookieStore = await cookies();
  const [{ data: profile }, { data: ownedVendor }] = await Promise.all([
    supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle(),
    supabase
      .from("vendors")
      .select("id, is_approved")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);

  // Same rule as dashboard layout: hide browse chrome in vendor-dashboard mode
  const isStudentToggle = cookieStore.get("isStudent")?.value !== "false";
  const isVendorAccount = profile?.account_type === "vendor";
  const hasVendor = !!ownedVendor?.is_approved;
  const isVendorDashboard = isVendorAccount || (hasVendor && !isStudentToggle);

  const isVerified = vendor.is_verified || vendor.subscription_tier === 'featured';
  const isOwner = vendor.owner_id === user.id;
  const isActive = checkSubscriptionActive(vendor);
  const showGallery = isActive && vendor.subscription_tier !== 'basic';

  // Check if can view (approved or owner)
  if (!vendor.is_approved && !isOwner) {
    redirect("/dashboard/vendors");
  }

  // Get reviews
  const reviews = await getVendorReviews(id, 10, supabase);

  // Check if user already reviewed
  const existingReview = await getUserVendorReview(id, user.id, supabase);

  // Track view (only if not owner)
  if (!isOwner) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vendors/track-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: id,
        event: "view",
        metadata: { source: "direct" },
      }),
    }).catch((error) => {
      console.error("Error tracking event:", error);
    });
  }

  return (
    <div className="space-y-6">
      <VendorViewTracker vendorId={id} vendorName={vendor.business_name} isOwner={isOwner} />
      {!isVendorDashboard && (
        <VendorHeader id={id} isOwner={isOwner} vendor={vendor} />
      )}

      {/* Pending Approval Notice */}
      {!vendor.is_approved && isOwner && (
        <Card className="border-warning/40 bg-warning-bg dark:border-warning/30 dark:bg-warning/10">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-warning-text">
              ⏳ Your listing is pending admin approval. It will be visible to
              students once approved.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Vendor Info */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-1">
            <VendorHero 
              vendor={vendor} 
              isVerified={isVerified}
            />
            
            <Card>
              <CardContent className="">
                <VendorDetailsInfo vendor={vendor} />
                {showGallery && (
                  <VendorGallery 
                    images={vendor.gallery_images} 
                    businessName={vendor.business_name} 
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <VendorReviewsSection 
            vendorId={id}
            reviews={reviews}
            isOwner={isOwner}
            existingReview={existingReview}
          />
        </div>

        {/* Right Column - Contact & Actions */}
        <div className="space-y-6">
          {!isOwner && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Contact Vendor</h3>
                <ContactButtons
                  vendorId={id}
                  phoneNumber={vendor.phone_number}
                  whatsappNumber={vendor.whatsapp_number}
                />
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <VendorOwnerStats 
              id={id}
              viewCount={vendor.view_count}
              contactCount={vendor.contact_count}
              ratingCount={vendor.rating_count}
              ratingAvg={vendor.rating_avg}
            />
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Share</h3>
              <ShareButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
