// components/vendors/vendor-card.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, MessageCircle, Crown, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface VendorCardProps {
  vendor: {
    id: string;
    business_name: string;
    description: string;
    location: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    rating_avg: number;
    rating_count: number;
    phone_number: string;
    whatsapp_number: string | null;
    services: string[];
    is_featured: boolean;
    is_verified: boolean;
    subscription_tier: string;
    vendor_categories: {
      name: string;
      icon: string;
    } | null;
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const isVerified = vendor.is_verified || vendor.subscription_tier === 'featured';

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0">
      {/* Cover Image */}
      <div className="relative h-32 bg-linear-to-r from-primary-500 to-secondary-500">
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
        
        {/* Featured Badge */}
        {vendor.is_featured && (
          <div className="absolute right-3 top-3">
            <Badge className="bg-amber-500 text-white">
              <Crown className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          </div>
        )}

        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-blue-500 text-white">
              <Award className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-0">
        {/* Logo */}
        <div className="relative -mt-12 mb-4">
          {vendor.logo_url ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-white shadow-lg">
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-4 border-white bg-primary-100 text-2xl font-bold text-primary-700 shadow-lg">
              {vendor.business_name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Name */}
        <div className="mb-1 flex items-center gap-1">
          <h3 className="text-lg font-bold line-clamp-1">
            {vendor.business_name}
          </h3>
          {isVerified && (
            <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white" />
          )}
        </div>

        {/* Category */}
        {vendor.vendor_categories && (
          <p className="mb-2 text-sm text-slate-600">
            {vendor.vendor_categories.icon} {vendor.vendor_categories.name}
          </p>
        )}

        {/* Description */}
        <p className="mb-3 text-sm text-slate-600 line-clamp-2">
          {vendor.description}
        </p>

        {/* Services */}
        <div className="mb-3 flex flex-wrap gap-1">
          {vendor.services.slice(0, 3).map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {vendor.services.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{vendor.services.length - 3} more
            </Badge>
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
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {vendor.rating_avg.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">
            ({vendor.rating_count})
          </span>
        </div>

        {/* Location */}
        {vendor.location && (
          <div className="mb-4 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{vendor.location}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href={`/dashboard/vendors/${vendor.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          
          {vendor.whatsapp_number && (
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 text-green-700 hover:bg-green-100"
              onClick={(e) => {
                e.preventDefault();
                const number = vendor.whatsapp_number!.replace(/\D/g, '');
                const message = encodeURIComponent('Hi, I found you on EngiPortal!');
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
