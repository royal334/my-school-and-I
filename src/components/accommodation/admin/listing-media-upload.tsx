'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import type { Unit } from './types';
import { primaryBtnClass } from './classes';

function buildStoragePath(unitId: string, index: number, ext: string | undefined) {
  return `listings/${unitId}/${Date.now()}_${index}.${ext}`;
}

export function ListingMediaUpload({ unit }: { unit: Unit }) {
  const supabase = createClient();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(0);
  const [media, setMedia] = useState(unit.media);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = buildStoragePath(unit.id, i, ext);

      const { error: upErr } = await supabase.storage
        .from('accommodation-media')
        .upload(path, file);

      if (!upErr) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('accommodation_media').insert({
          unit_id: unit.id,
          property_id: unit.property_id,
          file_path: path,
          file_name: file.name,
          file_type: file.type.startsWith('video/') ? 'video' : 'image',
          media_source: 'verified',
          display_order: media.length + i,
          is_cover: media.length === 0 && i === 0,
          uploaded_by: user?.id,
        });
        setMedia(prev => [...prev, { id: path, file_path: path, file_type: 'image', is_cover: media.length === 0 && i === 0, display_order: i }]);
      }
      setUploaded(i + 1);
    }

    setFiles([]);
    setUploading(false);
  };

  async function setAsCover(mediaId: string) {
    await supabase.from('accommodation_media').update({ is_cover: false }).eq('unit_id', unit.id);
    await supabase.from('accommodation_media').update({ is_cover: true }).eq('id', mediaId);
    setMedia(prev => prev.map(m => ({ ...m, is_cover: m.id === mediaId })));
  }

  return (
    <div className="flex flex-col gap-2.5">
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {media.map(m => (
            <div key={m.id} className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={m.file_path}
                alt=""
                className="h-full w-full object-cover"
              />
              {m.is_cover ? (
                <span className="absolute bottom-1 left-1 rounded-[3px] bg-[#E8A020] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#3A2800]">
                  Cover
                </span>
              ) : (
                <button
                  onClick={() => setAsCover(m.id)}
                  className="absolute bottom-1 left-1 cursor-pointer rounded-[3px] border-none bg-black/50 px-1.5 py-0.5 text-[9px] text-white"
                >
                  Set cover
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#C8E8DA] bg-primary-50/30 px-4 py-5 transition-colors hover:border-primary-500/50">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={e => setFiles(Array.from(e.target.files || []))}
          className="hidden"
        />
        <span className="text-[13px] font-medium text-primary-500">+ Add verified photos</span>
        <span className="text-[11px] text-stone-500 dark:text-stone-300">These are the photos students will see</span>
      </label>

      {files.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] text-[#1A3C34] dark:text-white">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={cn(primaryBtnClass, 'min-h-9 px-4 py-2')}
          >
            {uploading ? `Uploading ${uploaded}/${files.length}…` : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
}