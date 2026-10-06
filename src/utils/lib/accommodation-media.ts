import type { SupabaseClient } from '@supabase/supabase-js';

interface StorageMedia {
  file_path: string;
}

export async function withAccommodationMediaUrls<T extends StorageMedia>(
  supabase: SupabaseClient,
  media: T[],
) {
  return Promise.all(
    media.map(async item => {
      const storagePath = item.file_path;

      if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
        return {
          ...item,
          url: storagePath,
        };
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from('accommodation-media')
        .createSignedUrl(storagePath, 3600);

      let url = signedData?.signedUrl || null;

      if (!url) {
        const { data: publicData } = supabase.storage
          .from('accommodation-media')
          .getPublicUrl(storagePath);

        url = publicData?.publicUrl || null;
      }

      if (!url && signedError) {
        console.error('Accommodation media URL error:', {
          path: storagePath,
          message: signedError.message,
        });
      }

      return {
        ...item,
        url,
      };
    }),
  );
}