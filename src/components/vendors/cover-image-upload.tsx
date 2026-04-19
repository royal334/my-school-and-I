// components/vendors/cover-image-upload.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';

interface CoverImageUploadProps {
  vendorId: string;
  currentCoverUrl?: string | null;
  onUploadComplete: (url: string) => void;
  tier: 'basic' | 'premium' | 'featured';
}

export default function CoverImageUpload({
  vendorId,
  currentCoverUrl,
  onUploadComplete,
  tier,
}: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  // Check if user has access to cover images
  const hasAccess = tier !== 'basic';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendorId}/cover.${fileExt}`;

      // Delete old cover if exists
      if (currentCoverUrl) {
        const oldPath = currentCoverUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('vendor-images').remove([oldPath]);
      }

      // Upload new cover
      const { data, error } = await supabase.storage
        .from('vendor-images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('vendor-images').getPublicUrl(data.path);

      // Update vendor
      await supabase
        .from('vendors')
        .update({ cover_image_url: publicUrl })
        .eq('id', vendorId);

      toast.success('Cover image updated!');
      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentCoverUrl) return;

    try {
      const oldPath = currentCoverUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('vendor-images').remove([oldPath]);

      await supabase
        .from('vendors')
        .update({ cover_image_url: null })
        .eq('id', vendorId);

      setPreview(null);
      toast.success('Cover image removed');
      onUploadComplete('');
    } catch (error: any) {
      toast.error('Failed to remove image');
    }
  };

  if (!hasAccess) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 font-semibold text-slate-700">
          Cover Image Locked
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Upgrade to Premium or Featured to add a cover image
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
      {/* Preview */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-slate-100">
        {preview || currentCoverUrl ? (
          <>
            <Image
              src={preview || currentCoverUrl!}
              alt="Cover"
              fill
              className="object-cover"
            />
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">
                Upload cover image
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="cover-input"
        />
        <label htmlFor="cover-input">
          <Button asChild disabled={uploading}>
            <span>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {currentCoverUrl ? 'Change Cover' : 'Upload Cover'}
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="mt-2 text-xs text-slate-600">
          Recommended: 1200x400px. JPG, PNG or WebP. Max 5MB.
        </p>
      </div>
    </div>
  );
}