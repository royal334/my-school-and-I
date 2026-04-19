// components/vendors/gallery-upload.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface GalleryUploadProps {
  vendorId: string;
  currentImages: string[];
  onImagesChange: (images: string[]) => void;
  tier: 'basic' | 'premium' | 'featured';
}

export default function GalleryUpload({
  vendorId,
  currentImages = [],
  onImagesChange,
  tier,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const supabase = createClient();

  // Determine max images based on tier
  const maxImages = tier === 'featured' ? 10 : tier === 'premium' ? 5 : 0;
  const hasAccess = tier !== 'basic';
  const canAddMore = images.length < maxImages;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed limit
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed for ${tier} tier`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB`);
          continue;
        }

        // Upload
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${vendorId}/gallery-${timestamp}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('vendor-images')
          .upload(fileName, file, {
            contentType: file.type,
          });

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('vendor-images').getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);

        // Update vendor
        await supabase
          .from('vendors')
          .update({ gallery_images: newImages })
          .eq('id', vendorId);

        toast.success(`${uploadedUrls.length} image(s) uploaded!`);
        onImagesChange(newImages);
      }
    } catch (error: any) {
      console.error('Gallery upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (imageUrl: string) => {
    try {
      // Delete from storage
      const path = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('vendor-images').remove([path]);

      // Update state
      const newImages = images.filter((img) => img !== imageUrl);
      setImages(newImages);

      // Update vendor
      await supabase
        .from('vendors')
        .update({ gallery_images: newImages })
        .eq('id', vendorId);

      toast.success('Image removed');
      onImagesChange(newImages);
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image');
    }
  };

  if (!hasAccess) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 font-semibold text-slate-700">
          Photo Gallery Locked
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Upgrade to Premium (5 photos) or Featured (10 photos)
        </p>
        <Link href={`/dashboard/vendors/${vendorId}/upgrade`}>
          <Button className="mt-4" size="sm">
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {/* Existing Images */}
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-slate-100"
          >
            <Image
              src={imageUrl}
              alt={`Gallery ${index + 1}`}
              fill
              className="object-cover"
            />
            {/* Remove button */}
            <button
              onClick={() => handleRemove(imageUrl)}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && (
          <div className="aspect-square">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="gallery-input"
            />
            <label htmlFor="gallery-input" className="block h-full">
              <div className="flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary-500 hover:bg-primary-50">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                ) : (
                  <>
                    <Plus className="h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-xs text-slate-500">Add Photo</p>
                  </>
                )}
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-600">
          {images.length} / {maxImages} photos
        </p>
        {!canAddMore && (
          <p className="text-amber-600">
            {tier === 'premium'
              ? 'Upgrade to Featured for 10 photos'
              : 'Maximum reached'}
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Recommended: 1200x800px. JPG, PNG or WebP. Max 5MB per image.
      </p>
    </div>
  );
}