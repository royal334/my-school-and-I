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
      const { data, error } = await supabase.storage
        .from('accommodation-media')
        .createSignedUrl(item.file_path, 3600);

      if (error) {
        console.error('Accommodation media URL error:', {
          path: item.file_path,
          message: error.message,
        });
      }

      return {
        ...item,
        url: data?.signedUrl || null,
      };
    }),
  );
}