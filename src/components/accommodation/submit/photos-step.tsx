'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export function PhotosStep({
  submissionId,
  onComplete,
}: {
  submissionId: string;
  onComplete: () => void;
}) {
  const supabase = createClient();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(0);
  const [done, setDone] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 10));
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onComplete();
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `submissions/${submissionId}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('accommodation-media')
        .upload(path, file);

      if (!uploadError) {
        await supabase.from('accommodation_media').insert({
          submission_id: submissionId,
          file_path: path,
          file_name: file.name,
          file_type: file.type.startsWith('video/') ? 'video' : 'image',
          media_source: 'submission',
          display_order: i,
          is_cover: i === 0,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });
      }

      setUploaded(i + 1);
    }

    setUploading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(26,122,82,0.1)] text-2xl">
          ✓
        </div>
        <h3 className="mb-2.5 text-xl text-[#1A3C34] dark:text-[#ECEEED]">Submission complete</h3>
        <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-[#6B7B75] dark:text-[#9BA19E]">
          Our accommodation team will review your submission and get in touch. If the property is
          verified and rented through CampusHub, you&apos;ll receive a referral reward.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 min-h-[44px] cursor-pointer rounded bg-[#1A3C34] px-6 py-[11px] text-sm font-medium text-white transition-colors hover:bg-[#163229] dark:bg-[#7EC8A0] dark:text-[#0F1110] dark:hover:bg-[#A8D8C2]"
        >
          View my submissions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-[#6B7B75] dark:text-[#9BA19E]">
        Photos and videos help our team verify the property faster. You can add up to 10 files.
      </p>

      <label className="flex cursor-pointer flex-col items-center gap-2.5 rounded-md border-[1.5px] border-dashed border-[#C8E8DA] bg-[rgba(232,245,239,0.4)] px-4 py-7 dark:border-white/15 dark:bg-[#1E211F]/40">
        <input type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden" />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="#4A8C73" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="#4A8C73" strokeWidth="1.5" />
        </svg>
        <p className="text-sm font-medium text-[#4A8C73] dark:text-[#7EC8A0]">
          Tap to add photos or videos
        </p>
        <p className="text-[11px] text-[#6B7B75] dark:text-[#9BA19E]">JPG, PNG, MP4 — max 10 files</p>
      </label>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
              {file.type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#E8F5EF] text-[11px] text-[#4A8C73] dark:bg-[#1E211F] dark:text-[#7EC8A0]">
                  🎥 Video
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                className="absolute right-1 top-1 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-none bg-black/60 text-[13px] leading-none text-white transition-colors hover:bg-black/80"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-[3px] bg-[#E8A020] px-[5px] py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-[#3A2800]">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div>
          <div className="h-1 overflow-hidden rounded bg-[#E8F5EF] dark:bg-[#1E211F]">
            <div
              className="h-full bg-[#7EC8A0] transition-[width] duration-300"
              style={{ width: `${(uploaded / (files.length || 1)) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#6B7B75] dark:text-[#9BA19E]">
            Uploading {uploaded} of {files.length}…
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className={[
          'min-h-[48px] w-full cursor-pointer rounded px-5 py-3 text-[15px] font-medium transition-colors',
          uploading
            ? 'cursor-not-allowed bg-[#4A8C73] text-white'
            : 'bg-[#1A3C34] text-white hover:bg-[#163229] dark:bg-[#7EC8A0] dark:text-[#0F1110] dark:hover:bg-[#A8D8C2]',
        ].join(' ')}
      >
        {uploading
          ? `Uploading ${uploaded}/${files.length}…`
          : files.length > 0
            ? `Upload ${files.length} file${files.length > 1 ? 's' : ''} & submit`
            : 'Skip photos & submit'}
      </button>
    </div>
  );
}