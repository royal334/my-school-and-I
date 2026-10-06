"use client";

import { SubmissionMedia } from "../types";

interface MediaSectionProps {
  media: SubmissionMedia[];
}

export function MediaSection({ media }: MediaSectionProps) {
  if (media.length === 0) {
    return <p className="text-sm text-muted-foreground">No photos added yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
      {media.map((m) => {
        const imageSrc = m.url || m.file_path;

        return (
          <div key={m.id} className="relative aspect-square overflow-hidden rounded-lg border border-border">
            <img src={imageSrc} alt="" className="h-full w-full object-cover" />
            {m.is_cover && (
              <span className="absolute bottom-1 left-1 rounded-sm bg-accent-500 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-accent-foreground">
                Cover
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
