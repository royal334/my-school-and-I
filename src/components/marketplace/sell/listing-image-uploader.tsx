'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { MAX_LISTING_IMAGES } from '@/components/marketplace/constants';
import { cn } from '@/lib/utils';

interface ListingImageUploaderProps {
  listingId: string;
  sellerId: string;
  onUploaded: (paths: string[]) => void;
}

export function ListingImageUploader({ listingId, sellerId, onUploaded }: ListingImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingCount, setExistingCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadExistingCount() {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('marketplace_listing_images')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId);
      if (!error && count !== null && mounted) setExistingCount(count);
    }
    loadExistingCount();
    return () => {
      mounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    const active = previewsRef.current;
    return () => {
      active.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const remainingSlots = Math.max(0, MAX_LISTING_IMAGES - existingCount);

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const remaining = Math.max(0, MAX_LISTING_IMAGES - existingCount);
    if (remaining <= 0) {
      toast.error(`This listing already has ${MAX_LISTING_IMAGES} photos.`);
      return;
    }

    const selected = Array.from(event.target.files || []).slice(0, remaining);
    if (selected.length === 0) return;

    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));

    const nextPreviews = selected.map((file) => URL.createObjectURL(file));
    previewsRef.current = nextPreviews;
    setFiles(selected);
    setPreviews(nextPreviews);
    setProgress(0);
  }

  function removeFile(index: number) {
    const url = previewsRef.current[index];
    if (url) URL.revokeObjectURL(url);

    previewsRef.current = previewsRef.current.filter((_, idx) => idx !== index);
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function upload() {
    if (uploading) return;
    if (files.length === 0) {
      onUploaded([]);
      return;
    }

    setUploading(true);
    setProgress(0);
    const supabase = createClient();
    const uploadedPaths: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = file.name.split('.').pop() || 'jpg';
      // Unique path per upload so retries never collide with existing rows.
      const path = `listings/${sellerId}/${listingId}/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from('marketplace-images')
        .upload(path, file, { upsert: false });

      if (error) {
        toast.error(`Could not upload ${file.name}.`);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from('marketplace-images').getPublicUrl(path);

        const { error: insertError } = await supabase.from('marketplace_listing_images').insert({
          listing_id: listingId,
          file_path: publicUrl,
          file_name: file.name,
          display_order: existingCount + index,
          is_cover: existingCount + index === 0,
        });

        if (insertError) {
          toast.error(`Uploaded ${file.name} but could not attach it to the listing.`);
        } else {
          uploadedPaths.push(publicUrl);
        }
      }

      setProgress(Math.round(((index + 1) / files.length) * 100));
    }

    setUploading(false);
    setExistingCount((count) => count + uploadedPaths.length);

    if (uploadedPaths.length > 0) {
      toast.success(`Uploaded ${uploadedPaths.length} photo${uploadedPaths.length > 1 ? 's' : ''}.`);
      onUploaded(uploadedPaths);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors',
          remainingSlots <= 0 ? 'cursor-not-allowed opacity-60' : 'hover:border-primary-400 bg-primary-500/5',
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          disabled={remainingSlots <= 0}
        />
        <Camera className="size-7 text-primary" />
        <p className="m-0 text-[13px] font-medium text-primary">
          {remainingSlots > 0
            ? `Add up to ${remainingSlots} more photo${remainingSlots > 1 ? 's' : ''}`
            : 'Photo limit reached'}
        </p>
        <p className="m-0 text-[11px] text-muted-foreground">
          First photo will be the cover image
        </p>
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5">
          {previews.map((src, index) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {existingCount + index === 0 && (
                <span className="absolute bottom-0.5 left-0.5 rounded bg-accent px-1 py-px text-[8px] font-bold uppercase tracking-wide text-accent-950">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label="Remove photo"
                className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div>
          <div className="h-1 overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Uploading… {progress}%</p>
        </div>
      )}

      <Button type="button" onClick={upload} disabled={uploading || files.length === 0} className="min-h-11 w-full">
        {uploading
          ? `Uploading ${progress}%…`
          : files.length > 0
            ? `Upload ${files.length} photo${files.length > 1 ? 's' : ''} & publish`
            : 'Skip photos & publish'}
      </Button>
    </div>
  );
}