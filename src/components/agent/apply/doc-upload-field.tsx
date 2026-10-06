'use client';

import { CheckCircle2, FileText, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DocUploadField({
  label,
  file,
  onSelect,
}: {
  label: string;
  file: File | null;
  onSelect: (file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium tracking-[-0.01em] text-foreground">{label}</label>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-success/25 bg-success-bg px-3.5 py-3">
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-success-text">
            {file.name}
          </p>
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label={`Remove ${file.name}`}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-success-text transition-colors hover:bg-success/15"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-input px-4 py-6 transition-colors',
            'hover:border-primary/50 hover:bg-primary-50/50 dark:hover:bg-white/5',
          )}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={e => onSelect(e.target.files?.[0] ?? null)}
          />
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
            <UploadCloud className="size-5 text-primary-600 dark:text-primary-300" aria-hidden />
          </span>
          <span className="text-[13px] font-medium text-primary-600 dark:text-primary-300">
            Tap to upload document
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <FileText className="size-3" aria-hidden />
            JPG, PNG or PDF
          </span>
        </label>
      )}
    </div>
  );
}