'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { SectionTitle } from './section-title';
import type { LeadMedia } from './types';

export function MediaGallery({ images }: { images: LeadMedia[] }) {
  const [activeImage, setActiveImage] = useState(0);

  if (images.length === 0) return null;

  return (
    <Card>
      <SectionTitle>Student-submitted photos</SectionTitle>
      <div className="mt-2 overflow-hidden rounded-lg">
        <img
          src={images[activeImage].file_path}
          alt=""
          className="max-h-60 w-full rounded-lg object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(i)}
              className={cn(
                'h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 p-0',
                i === activeImage ? 'border-primary-300' : 'border-transparent',
              )}
            >
              <img src={img.file_path} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}