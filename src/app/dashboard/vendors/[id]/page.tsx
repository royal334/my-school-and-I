// app/dashboard/vendors/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import {
  getVendorById,
  getVendorReviews,
  getUserVendorReview,
} from "@/utils/supabase/queries";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Crown,
  Award,
  Edit,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReviewCard from "@/components/vendors/review-card";
import ReviewForm from "@/components/vendors/review-form";
import ContactButtons from "@/components/vendors/contact-buttons";
import ShareButton from "@/components/vendors/share-button";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function VendorDetailPage({ params }: PageProps) {
  const supabase = createClient(await cookies());
  const parameters = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get vendor details
  const vendor = await getVendorById(parameters.id, supabase);

  if (!vendor) {
    notFound();
  }

  // Check if user owns this vendor
  const isOwner = vendor.owner_id === user.id;

  // Check if can view (approved or owner)
  if (!vendor.is_approved && !isOwner) {
    redirect("/dashboard/vendors");
  }

  // Get reviews
  const reviews = await getVendorReviews(parameters.id, 10, supabase);

  // Check if user already reviewed
  const existingReview = await getUserVendorReview(
    parameters.id,
    user.id,
    supabase,
  );

  // Track view (only if not owner)
  if (!isOwner) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/vendors/track-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: parameters.id,
        event: "view",
        metadata: { source: "direct" },
      }),
    }).catch(() => {}); // Fail silently
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-2">
        <Link href="/dashboard/vendors">
          <Button variant="ghost" size="sm">
            ← Back to Vendors
          </Button>
        </Link>

        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/dashboard/vendors/${parameters.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href={`/dashboard/vendors/${parameters.id}/analytics`}>
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pending Approval Notice */}
      {!vendor.is_approved && isOwner && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-900">
              ⏳ Your listing is pending admin approval. It will be visible to
              students once approved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Vendor Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cover & Logo */}
          <Card className="overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 bg-linear-to-r from-primary-500 to-secondary-500">
              {vendor.cover_image_url ? (
                <Image
                  src={vendor.cover_image_url}
                  alt={vendor.business_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary-400 to-secondary-500" />
              )}

              {/* Badges */}
              <div className="absolute right-4 top-4 flex gap-2">
                {vendor.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Crown className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {vendor.is_verified && (
                  <Badge className="bg-blue-500 text-white">
                    <Award className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="pt-0">
              {/* Logo */}
              <div className="relative -mt-16 mb-4">
                {vendor.logo_url ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg border-4 border-white shadow-lg">
                    <Image
                      src={vendor.logo_url}
                      alt={vendor.business_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border-4 border-white bg-primary-100 text-3xl font-bold text-primary-700 shadow-lg">
                    {vendor.business_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Business Name & Category */}
              <h1 className="mb-2 text-3xl font-bold">
                {vendor.business_name}
              </h1>

              {vendor.vendor_categories && (
                <p className="mb-4 text-lg text-slate-600">
                  {vendor.vendor_categories.icon}{" "}
                  {vendor.vendor_categories.name}
                </p>
              )}

              {/* Rating */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(vendor.rating_avg)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {vendor.rating_avg.toFixed(1)}
                </span>
                <span className="text-slate-600">
                  ({vendor.rating_count} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="mb-6 text-slate-700 leading-relaxed">
                {vendor.description}
              </p>

              {/* Services */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.services.map((service: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location & Hours */}
              <div className="space-y-2 text-sm">
                {vendor.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.location}</span>
                  </div>
                )}
                {vendor.operating_hours && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{vendor.operating_hours}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Customer Reviews</h2>

              {/* Review Form (if not owner and haven't reviewed) */}
              {!isOwner && !existingReview && (
                <div className="mb-6">
                  <ReviewForm vendorId={parameters.id} />
                </div>
              )}

              {/* Reviews List */}
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact & Actions */}
        <div className="space-y-6">
          {/* Contact Card */}
          {!isOwner && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Contact Vendor</h3>
                <ContactButtons
                  vendorId={parameters.id}
                  phoneNumber={vendor.phone_number}
                  whatsappNumber={vendor.whatsapp_number}
                />
              </CardContent>
            </Card>
          )}

          {/* Stats Card (for owner) */}
          {isOwner && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Views</span>
                    <span className="font-semibold">{vendor.view_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Contacts</span>
                    <span className="font-semibold">
                      {vendor.contact_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Reviews</span>
                    <span className="font-semibold">{vendor.rating_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Rating</span>
                    <span className="font-semibold">
                      {vendor.rating_avg.toFixed(1)} ⭐
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/vendors/${parameters.id}/upgrade`}
                  className="mt-4 block"
                >
                  <Button className="w-full" variant="outline">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Share Card */}
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
