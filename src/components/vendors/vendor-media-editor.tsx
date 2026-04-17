'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LogoUpload from './logo-upload';
import CoverImageUpload from './cover-image-upload';
import GalleryUpload from './gallery-upload';
import { useRouter } from 'next/navigation';

interface VendorMediaEditorProps {
  vendor: {
    id: string;
    logo_url: string | null;
    cover_image_url: string | null;
    gallery_images?: string[] | null;
    subscription_tier: 'basic' | 'premium' | 'featured';
  };
}

export default function VendorMediaEditor({ vendor }: VendorMediaEditorProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <p className="text-sm text-slate-600">
            {vendor.subscription_tier === 'basic'
              ? 'Upgrade to Premium or Featured to add a logo'
              : 'Upload your business logo (square image recommended)'}
          </p>
        </CardHeader>
        <CardContent>
          <LogoUpload
            vendorId={vendor.id}
            currentLogoUrl={vendor.logo_url}
            tier={vendor.subscription_tier}
            onUploadComplete={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Cover Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <p className="text-sm text-slate-600">
            {vendor.subscription_tier === 'basic'
              ? 'Upgrade to Premium or Featured to add a cover image'
              : 'Upload a cover image for your vendor page'}
          </p>
        </CardHeader>
        <CardContent>
          <CoverImageUpload
            vendorId={vendor.id}
            currentCoverUrl={vendor.cover_image_url}
            tier={vendor.subscription_tier}
            onUploadComplete={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Gallery Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <p className="text-sm text-slate-600">
            {vendor.subscription_tier === 'basic'
              ? 'Upgrade to Premium (5 photos) or Featured (10 photos)'
              : vendor.subscription_tier === 'premium'
              ? 'Upload up to 5 photos showcasing your business'
              : 'Upload up to 10 photos showcasing your business'}
          </p>
        </CardHeader>
        <CardContent>
          <GalleryUpload
            vendorId={vendor.id}
            currentImages={vendor.gallery_images || []}
            tier={vendor.subscription_tier}
            onImagesChange={handleRefresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}
