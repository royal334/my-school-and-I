'use client';

import { useState } from 'react';
import type { MediaItem } from '@/components/accommodation/types';

interface ImageGalleryProps {
  images: MediaItem[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div style={{ position: 'relative', width: '100%', height: 260, background: 'var(--color-mist, #E8F5EF)', overflow: 'hidden' }}>
      {images.length > 0 ? (
        <>
          <img
            src={images[activeImage].file_path}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: i === activeImage ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === activeImage ? 'white' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'width 200ms ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="9" width="18" height="13" rx="2" stroke="#4A8C73" strokeWidth="1.5" />
            <path d="M9 9V7a3 3 0 016 0v2" stroke="#4A8C73" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}