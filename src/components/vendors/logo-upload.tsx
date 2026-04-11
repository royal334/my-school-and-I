'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface LogoUploadProps {
  vendorId: string;
  currentLogoUrl?: string | null;
  onUploadComplete: (url: string) => void;
  tier: 'basic' | 'premium' | 'featured';
}

export default function LogoUpload({
  vendorId,
  currentLogoUrl,
  onUploadComplete,
  tier,
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  const hasAccess = tier !== 'basic';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasAccess) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendorId}/logo.${fileExt}`;

      // Delete old logo
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('vendor-logos').remove([oldPath]);
      }

      // Upload new
      const { data, error } = await supabase.storage
        .from('vendor-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-logos')
        .getPublicUrl(data.path);

      // Update vendor
      await supabase
        .from('vendors')
        .update({ logo_url: publicUrl })
        .eq('id', vendorId);

      toast.success('Logo updated!');
      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentLogoUrl) return;

    try {
      const oldPath = currentLogoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('vendor-logos').remove([oldPath]);

      await supabase
        .from('vendors')
        .update({ logo_url: null })
        .eq('id', vendorId);

      setPreview(null);
      toast.success('Logo removed');
      onUploadComplete('');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Failed to remove logo');
    }
  };

  if (!hasAccess) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 font-semibold text-slate-700">Logo Locked</h3>
        <p className="mt-2 text-sm text-slate-600">
          Upgrade to Premium or Featured to add a business logo
        </p>
        <Button className="mt-4" size="sm">
          Upgrade Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-white">
        {preview || currentLogoUrl ? (
          <>
            <Image
              src={preview || currentLogoUrl!}
              alt="Logo"
              fill
              className="object-cover"
            />
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 shadow-sm"
              title="Remove logo"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
            LOGO
          </div>
        )}
      </div>

      {/* Upload */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="logo-input"
        />
        <label htmlFor="logo-input">
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
                  {currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="mt-2 text-xs text-slate-600">
          Square image recommended. Max 5MB.
        </p>
      </div>
    </div>
  );
}