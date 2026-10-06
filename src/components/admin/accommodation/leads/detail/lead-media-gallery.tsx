'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadMedia } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

function Thumb({
  item,
  active,
  onSelect,
}: {
  item: LeadMedia;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={cn(
        'relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none',
        active
          ? 'border-primary-500'
          : 'border-transparent hover:border-primary-300 dark:hover:border-primary-700',
      )}
    >
      {item.file_type === 'video' ? (
        <>
          <video src={item.url || undefined} muted className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35">
            <Play className="size-3.5 text-white" aria-hidden />
          </span>
        </>
      ) : (
        <img src={item.url || ''} alt="" className="h-full w-full object-cover" />
      )}
    </button>
  );
}

export function LeadMediaGallery({
  media,
  isAgent,
}: {
  media: LeadMedia[];
  isAgent: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewable = media.filter(item => item.url);

  if (viewable.length === 0) return null;

  const active = viewable[activeIndex] ?? viewable[0];

  return (
    <LeadCard>
      <SectionTitle>
        {isAgent ? 'Agent-submitted photos' : 'Student-submitted photos'}
      </SectionTitle>

      <div className="mt-2 overflow-hidden rounded-lg bg-stone-100 dark:bg-primary-500/10">
        {active.file_type === 'video' ? (
          <video
            src={active.url || undefined}
            controls
            playsInline
            className="max-h-60 w-full object-cover"
          />
        ) : (
          <img
            src={active.url || ''}
            alt={`Evidence photo ${activeIndex + 1} of ${viewable.length}`}
            className="max-h-60 w-full object-cover"
          />
        )}
      </div>

      {viewable.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {viewable.map((item, index) => (
            <Thumb
              key={item.id}
              item={item}
              active={index === activeIndex}
              onSelect={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </LeadCard>
  );
}