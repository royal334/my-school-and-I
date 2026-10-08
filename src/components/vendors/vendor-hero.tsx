"use client"
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Award, CheckCircle2 } from "lucide-react";
import { useVendorFeatures } from "@/hooks/use-vendor-features";

interface VendorHeroProps {
  vendor: any;
  isVerified: boolean;
}

export default function VendorHero({ vendor, isVerified }: VendorHeroProps) {

  const features = useVendorFeatures(vendor);

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-linear-to-r from-primary-900 to-primary-600">
        {vendor.cover_image_url && features.canUploadCover ? (
          <Image
            src={vendor.cover_image_url}
            alt={vendor.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary-900 to-primary-600" />
        )}

        {/* Badges */}
        <div className="absolute right-4 top-4 flex gap-2">
          {features.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent-500 text-accent-950">
              <Crown className="mr-1 h-3 w-3" />
              Featured
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-black/40 text-white">
              <Award className="mr-1 h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      <CardContent className="pt-0">
        {/* Logo */}
        <div className="relative -mt-16 mb-4">
          {vendor.logo_url && features.canUploadLogo ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg border-4 border-white dark:border-border bg-primary-50 dark:bg-muted text-3xl font-bold text-primary-700 dark:text-primary-300 shadow-lg">
              {vendor.business_name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Name & Category */}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              {vendor.business_name}
            </h1>
            {isVerified && (
              <CheckCircle2 className="h-6 w-6 fill-success text-white" />
            )}
          </div>

        {vendor.vendor_categories && (
          <p className="mb-4 text-lg text-muted-foreground">
            {vendor.vendor_categories.emoji}{" "}
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
                    ? "fill-accent-400 text-accent-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">
            {vendor.rating_avg.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({vendor.rating_count} reviews)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
