'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';
import type { MediaItem } from '@/components/accommodation/types';

interface ImageGalleryProps {
  media: MediaItem[];
  name: string;
}

function MediaView({
  item,
  name,
  fit,
  autoPlay,
}: {
  item: MediaItem;
  name: string;
  fit: 'cover' | 'contain';
  autoPlay?: boolean;
}) {
  if (item.file_type === 'video') {
    return (
      <video
        src={item.url || undefined}
        aria-label={name}
        controls
        playsInline
        autoPlay={autoPlay}
        style={{ width: '100%', height: '100%', objectFit: fit, background: '#000' }}
      />
    );
  }
  return (
    <img
      src={item.url || undefined}
      alt={name}
      style={{ width: '100%', height: '100%', objectFit: fit }}
    />
  );
}

function useSwipeNavigation(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  const touchProps = {
    onTouchStart: (e: TouchEvent<HTMLDivElement>) => {
      startX.current = e.touches[0]?.clientX ?? null;
      moved.current = false;
    },
    onTouchMove: (e: TouchEvent<HTMLDivElement>) => {
      if (startX.current === null) return;
      const x = e.touches[0]?.clientX ?? null;
      if (x !== null && Math.abs(x - startX.current) > 12) moved.current = true;
    },
    onTouchEnd: (e: TouchEvent<HTMLDivElement>) => {
      if (startX.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? null;
      if (endX !== null) {
        const delta = endX - startX.current;
        if (Math.abs(delta) > 40) {
          if (delta < 0) onNext();
          else onPrev();
        }
      }
      startX.current = null;
    },
  };

  const guardTap = () => {
    if (moved.current) {
      moved.current = false;
      return true;
    }
    return false;
  };

  return { touchProps, guardTap };
}

const lightboxBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(11, 11, 18, 0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'zoom-out',
};

const arrowButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(79, 70, 229, 0.55)',
  color: '#fff',
  cursor: 'pointer',
};

export function ImageGallery({ media, name }: ImageGalleryProps) {
  const validMedia = media.filter((item) => item.url);
  const count = validMedia.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const safeIndex = count === 0 ? 0 : Math.min(activeIndex, count - 1);

  const prevItem = () => setActiveIndex((i) => (i - 1 + count) % count);
  const nextItem = () => setActiveIndex((i) => (i + 1) % count);

  const openLightbox = () => setLightboxIndex(safeIndex);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const lightboxPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  const lightboxNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );

  const galleryHandlers = useSwipeNavigation(prevItem, nextItem);
  const lightboxHandlers = useSwipeNavigation(lightboxPrev, lightboxNext);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'ArrowRight') lightboxNext();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, lightboxPrev, lightboxNext]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 260,
        background: 'var(--muted)',
        overflow: 'hidden',
      }}
    >
      {count > 0 ? (
        <div
          style={{ width: '100%', height: '100%', cursor: 'zoom-in', touchAction: 'pan-y' }}
          onClick={() => {
            if (!galleryHandlers.guardTap()) openLightbox();
          }}
          {...galleryHandlers.touchProps}
        >
          <MediaView item={validMedia[safeIndex]} name={name} fit="cover" />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-primary">
            <rect x="3" y="9" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {count > 0 && (
        <button
          aria-label="View full screen"
          onClick={openLightbox}
          style={{
            position: 'absolute',
            right: 10,
            bottom: 12,
            ...arrowButtonStyle,
            width: 34,
            height: 34,
          }}
        >
          <Maximize size={16} />
        </button>
      )}

      {count > 1 && (
        <>
          <button
            aria-label="Previous media"
            onClick={prevItem}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', ...arrowButtonStyle }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            aria-label="Next media"
            onClick={nextItem}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', ...arrowButtonStyle }}
          >
            <ChevronRight size={24} />
          </button>

          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(79, 70, 229, 0.6)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full, 10px)',
            }}
          >
            {safeIndex + 1} / {count}
          </span>

          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {validMedia.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Go to media ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: i === safeIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === safeIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 200ms ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && count > 0 && (
        <div
          style={lightboxBackdropStyle}
          onClick={() => {
            if (!lightboxHandlers.guardTap()) closeLightbox();
          }}
          {...lightboxHandlers.touchProps}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} media viewer`}
        >
          <button
            aria-label="Close full screen"
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 2,
              ...arrowButtonStyle,
              width: 40,
              height: 40,
              background: 'rgba(255, 255, 255, 0.15)',
            }}
          >
            <X size={22} />
          </button>

          <span
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full, 10px)',
            }}
          >
            {(lightboxIndex % count) + 1} / {count}
          </span>

          {count > 1 && (
            <>
              <button
                aria-label="Previous media"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxPrev();
                }}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  ...arrowButtonStyle,
                  background: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                <ChevronLeft size={30} />
              </button>
              <button
                aria-label="Next media"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxNext();
                }}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  ...arrowButtonStyle,
                  background: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                <ChevronRight size={30} />
              </button>
            </>
          )}

          <div
            style={{
              width: '100%',
              height: '100%',
              maxWidth: 'min(100vw, 900px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MediaView
              item={validMedia[lightboxIndex % count]}
              name={name}
              fit="contain"
              autoPlay
            />
          </div>
        </div>
      )}
    </div>
  );
}