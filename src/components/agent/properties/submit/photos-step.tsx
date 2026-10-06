"use client";

import { ImageIcon } from "lucide-react";

interface PhotosStepProps {
  submissionId: string | null;
  files: File[];
  previews: string[];
  uploading: boolean;
  uploadProgress: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function PhotosStep({
  submissionId,
  files,
  previews,
  uploading,
  uploadProgress,
  onFileSelect,
  onUpload,
}: PhotosStepProps) {
  if (!submissionId) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Add up to 10 photos. As an agent, high-quality photos help your submissions get verified
        faster.
      </p>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/20 bg-primary-50/40 px-4 py-6 text-center transition-colors hover:border-primary/40 dark:border-primary/30 dark:bg-primary-950/20 dark:hover:border-primary/50">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={onFileSelect}
          className="hidden"
        />
        <ImageIcon className="size-7 text-primary" />
        <p className="text-sm font-medium text-primary">Add photos (up to 10)</p>
        <p className="text-xs text-muted-foreground">First photo = cover image</p>
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-sm bg-accent-500 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-accent-foreground">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Uploading {uploadProgress}%</p>
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={uploading}
        className="min-h-[50px] w-full cursor-pointer rounded-lg bg-primary px-5 py-[13px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
      >
        {uploading
          ? `Uploading ${uploadProgress}%`
          : files.length > 0
          ? `Upload ${files.length} photo${files.length > 1 ? "s" : ""} & finish`
          : "Skip photos & finish"}
      </button>
    </div>
  );
}
