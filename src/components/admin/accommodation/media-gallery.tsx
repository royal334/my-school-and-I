'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { SectionTitle } from './section-title';
import type { LeadMedia } from './types';

export function MediaGallery({ media }: { media: LeadMedia[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const validMedia = media.filter(item => item.url);

  if (validMedia.length === 0) return null;

  const activeMedia = validMedia[activeImage] || validMedia[0];

  return (
    <Card>
      <SectionTitle>Student-submitted photos</SectionTitle>
      <div className="mt-2 overflow-hidden rounded-lg">
        {activeMedia.file_type === 'video' ? (
          <video
            src={activeMedia.url || undefined}
            controls
            className="max-h-60 w-full rounded-lg object-cover"
          />
        ) : (
          <img
            src={activeMedia.url || undefined}
            alt=""
            className="max-h-60 w-full rounded-lg object-cover"
          />
        )}
      </div>
      {validMedia.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {validMedia.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveImage(i)}
              className={cn(
                'h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 p-0',
                i === activeImage ? 'border-primary-300' : 'border-transparent',
              )}
            >
              {item.file_type === 'video' ? (
                <video src={item.url || undefined} muted className="h-full w-full object-cover" />
              ) : (
                <img src={item.url || ''} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}