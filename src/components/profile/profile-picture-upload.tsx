'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  userId: string;
  currentPictureUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export default function ProfilePictureUpload({
  userId,
  currentPictureUrl,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

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
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete old file if exists
      if (currentPictureUrl) {
        const oldPath = currentPictureUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('profile-pictures').remove([oldPath]);
      }

      // Upload new file
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      toast.success('Profile picture updated!');
      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-slate-100">
        {(preview || currentPictureUrl) ? (
          <Image
            src={preview || currentPictureUrl!}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-slate-400">
            ?
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
          id="profile-picture-input"
        />
        <label htmlFor="profile-picture-input">
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
                  Upload Photo
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="mt-2 text-xs text-slate-600">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>
    </div>
  );
}