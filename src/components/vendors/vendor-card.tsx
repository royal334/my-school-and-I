'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, MessageCircle, Crown, Award, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useVendorFeatures } from '@/hooks/use-vendor-features';

interface VendorCardProps {
  vendor: any
  showPriority?:boolean
}

export default function VendorCard({ vendor,showPriority = false }: VendorCardProps) {
  const isVerified = vendor.is_verified;

  const features = useVendorFeatures(vendor)

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0 border-[#D6E5DF] dark:border-white/10">
      {/* Cover Image */}
      <div className="relative h-32 bg-linear-to-r from-[#1A3C34] to-[#4A8C73]">
        {vendor.cover_image_url && features.canUploadCover ?(
          <Image
            src={vendor.cover_image_url}
            alt={vendor.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#1A3C34] to-[#4A8C73]" />
        )}
        
        {/* Featured Badge */}
        {/* {features.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#E8A020] text-[#3A2800]">
              <Crown className="h-3 w-3" />
              Featured
            </span>
          </div>
        )} */}

        {/* {features.isPremium && !features.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#FFF0D4] text-[#9E6A08] border border-[#E8A020]">
              <Sparkles className="h-3 w-3" />
              Premium
            </span>
          </div>
        )} */}

        {/* Verified Badge */}
        {isVerified&& (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#1A3C34] text-[#B8D4CC]">
              <Award className="h-3 w-3" />
              Verified
            </span>
          </div>
        )}
      </div>

      <CardContent className="pt-0">
        {/* Logo */}
        <div className="relative -mt-12 mb-4">
          {vendor.logo_url && features.canUploadLogo ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-white shadow-lg dark:border-[#262928]">
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-4 border-white bg-[#E8F5EF] text-2xl font-bold text-[#3A7260] shadow-lg dark:border-[#262928] dark:bg-[#1E211F] dark:text-[#7EC8A0]">
              {vendor.business_name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Name */}
        <div className="mb-1 flex items-center gap-1">
          <h3 className="text-lg font-medium line-clamp-1 text-[#141F1B] dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
            {vendor.business_name}
          </h3>
          {isVerified && (
            <CheckCircle2 className="h-4 w-4 fill-[#4A8C73] text-white" />
          )}
        </div>

        {/* Category */}
        {vendor.vendor_categories && (
          <p className="mb-2 text-sm text-[#6B7B75] dark:text-[#9BA19E]">
            {vendor.vendor_categories.icon} {vendor.vendor_categories.name}
          </p>
        )}

        {/* Description */}
        <p className="mb-3 text-sm text-[#6B7B75] line-clamp-2 dark:text-[#9BA19E]">
          {vendor.description}
        </p>

        {/* Services */}
        <div className="mb-3 flex flex-wrap gap-1">
          {vendor.services.slice(0, 3).map((service :any, index:any) => (
            <span key={index} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#F0F5F3] dark:bg-[#1E211F] text-[#6B7B75] dark:text-[#9BA19E] border border-[#D6E5DF] dark:border-white/10">
              {service}
            </span>
          ))}
          {vendor.services.length > 3 && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#F0F5F3] dark:bg-[#1E211F] text-[#6B7B75] dark:text-[#9BA19E] border border-[#D6E5DF] dark:border-white/10">
              +{vendor.services.length - 3} more
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(vendor.rating_avg)
                    ? 'fill-[#E8A020] text-[#E8A020]'
                    : 'text-[#D6E5DF] dark:text-[#3D4A46]'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-[#141F1B] dark:text-[#E8F5EF]">
            {vendor.rating_avg.toFixed(1)}
          </span>
          <span className="text-xs text-[#9AADA8]">
            ({vendor.rating_count})
          </span>
        </div>

        {/* Location */}
        {vendor.location && (
          <div className="mb-4 flex items-center gap-1 text-sm text-[#6B7B75] dark:text-[#9BA19E]">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{vendor.location}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href={`/dashboard/vendors/${vendor.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              View details
            </Button>
          </Link>
          
          {vendor.whatsapp_number && (
            <Button
              size="sm"
              variant="outline"
              className="bg-[#E8F5EF] text-[#1A7A52] hover:bg-[#D1EBE1] dark:bg-[rgba(26,122,82,0.15)] dark:text-[#7EC8A0] dark:hover:bg-[rgba(26,122,82,0.25)]"
              onClick={(e) => {
                e.preventDefault();
                const number = vendor.whatsapp_number!.replace(/\D/g, '');
                const message = encodeURIComponent('Hi, I found you on CampusHub!');
                window.open(`https://wa.me/234${number.slice(1)}?text=${message}`);
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
