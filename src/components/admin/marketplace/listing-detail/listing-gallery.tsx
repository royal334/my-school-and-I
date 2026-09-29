'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Panel } from '../panel';
import { SectionTitle } from '../section-title';
import type { AdminListingImage } from '../types';

interface ListingGalleryProps {
  images: AdminListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const active = images[activeIndex] ?? images[0];

  return (
    <Panel>
      <SectionTitle>Images ({images.length})</SectionTitle>

      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        <img
          src={active.file_path}
          alt={`${title} — image ${activeIndex + 1}`}
          className="max-h-60 w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                'size-12 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 p-0 transition-colors',
                index === activeIndex
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-border',
              )}
            >
              <img
                src={image.file_path}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
