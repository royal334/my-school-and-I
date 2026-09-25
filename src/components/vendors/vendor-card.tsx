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
    <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0 border-border">
      {/* Cover Image */}
      <div className="relative h-32 bg-linear-to-r from-primary-900 to-primary-600">
        {vendor.cover_image_url && features.canUploadCover ?(
          <Image
            src={vendor.cover_image_url}
            alt={vendor.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary-900 to-primary-600" />
        )}
        
        {/* Featured Badge */}
        {/* {features.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent-500 text-accent-950">
              <Crown className="h-3 w-3" />
              Featured
            </span>
          </div>
        )} */}

        {/* {features.isPremium && !features.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent-50 text-accent-600 border border-accent-500">
              <Sparkles className="h-3 w-3" />
              Premium
            </span>
          </div>
        )} */}

        {/* Verified Badge */}
        {isVerified&& (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-black/40 text-white">
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
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-white shadow-lg dark:border-border">
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-4 border-white bg-primary-50 text-2xl font-bold text-primary-700 shadow-lg dark:border-border dark:bg-muted dark:text-primary-300">
              {vendor.business_name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Name */}
        <div className="mb-1 flex items-center gap-1">
          <h3 className="text-lg font-medium line-clamp-1 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {vendor.business_name}
          </h3>
          {isVerified && (
            <CheckCircle2 className="h-4 w-4 fill-success text-white" />
          )}
        </div>

        {/* Category */}
        {vendor.vendor_categories && (
          <p className="mb-2 text-sm text-muted-foreground">
            {vendor.vendor_categories.icon} {vendor.vendor_categories.name}
          </p>
        )}

        {/* Description */}
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {vendor.description}
        </p>

        {/* Services */}
        <div className="mb-3 flex flex-wrap gap-1">
          {vendor.services.slice(0, 3).map((service :any, index:any) => (
            <span key={index} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
              {service}
            </span>
          ))}
          {vendor.services.length > 3 && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
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
                    ? 'fill-accent-500 text-accent-500'
                    : 'text-border dark:text-muted-foreground/40'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {vendor.rating_avg.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({vendor.rating_count})
          </span>
        </div>

        {/* Location */}
        {vendor.location && (
          <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
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
              className="bg-success-bg text-success hover:bg-success/15 dark:bg-success/15 dark:text-success dark:hover:bg-success/25"
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
