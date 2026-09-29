'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingImage } from '@/components/marketplace/types';

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  isSold?: boolean;
}

export function ListingGallery({ images, title, isSold = false }: ListingGalleryProps) {
  // Defensive dedupe: mirror rows can hold duplicate file_path entries.
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((image) => {
      if (seen.has(image.file_path)) return false;
      seen.add(image.file_path);
      return true;
    });
  }, [images]);

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const current = uniqueImages[active];

  useEffect(() => {
    if (lightbox === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') {
        setActive((i) => (i > 0 ? i - 1 : uniqueImages.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActive((i) => (i < uniqueImages.length - 1 ? i + 1 : 0));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox, uniqueImages.length]);

  if (current) {
    return (
      <>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          <button
            type="button"
            onClick={() => setLightbox(active)}
            aria-label="View image full screen"
            className="block h-full w-full cursor-zoom-in"
          >
            <img
              src={current.file_path}
              alt={title}
              className="h-full w-full object-cover"
            />
          </button>

          {uniqueImages.length > 1 && (
            <>
              {active > 0 && (
                <GalleryArrow
                  side="left"
                  onClick={() => setActive((i) => Math.max(0, i - 1))}
                />
              )}
              {active < uniqueImages.length - 1 && (
                <GalleryArrow
                  side="right"
                  onClick={() => setActive((i) => Math.min(uniqueImages.length - 1, i + 1))}
                />
              )}

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {uniqueImages.map((image, i) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === active}
                    className={cn(
                      'h-1.5 rounded-full border-none p-0 transition-all duration-200',
                      i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/50',
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg bg-black/60 px-5 py-2 text-[18px] font-bold uppercase tracking-widest text-white">
                ✓ Sold
              </span>
            </div>
          )}
        </div>

        {lightbox !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Full screen image viewer"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close full screen viewer"
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </button>

            {active > 0 && (
              <GalleryArrow
                side="left"
                fullscreen
                onClick={() => setActive((i) => Math.max(0, i - 1))}
              />
            )}
            {active < uniqueImages.length - 1 && (
              <GalleryArrow
                side="right"
                fullscreen
                onClick={() => setActive((i) => Math.min(uniqueImages.length - 1, i + 1))}
              />
            )}

            <img
              src={uniqueImages[active].file_path}
              alt={`${title} — image ${active + 1}`}
              className="max-h-[85vh] w-full object-contain"
            />

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {uniqueImages.length}
            </span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted">
      <span className="text-5xl">📦</span>
    </div>
  );
}

function GalleryArrow({
  side,
  fullscreen = false,
  onClick,
}: {
  side: 'left' | 'right';
  fullscreen?: boolean;
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      className={cn(
        'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border-none text-white',
        fullscreen ? 'bg-white/15 hover:bg-white/25' : 'bg-black/40 hover:bg-black/60',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}