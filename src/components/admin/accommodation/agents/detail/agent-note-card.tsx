import type { LucideIcon } from 'lucide-react';
import { MessageSquareQuote, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';

export function AgentNoteCard({
  tone,
  title,
  note,
  icon: Icon,
}: {
  tone: 'info' | 'warning';
  title: string;
  note: string;
  icon?: LucideIcon;
}) {
  const FallbackIcon = tone === 'info' ? MessageSquareQuote : NotebookPen;
  const NoteIcon = Icon ?? FallbackIcon;

  return (
    <Card
      className={cn(
        tone === 'info'
          ? 'border-info/25 bg-info-bg'
          : 'border-accent-500/25 bg-accent-500/[0.07]',
      )}
    >
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-1 flex items-start gap-2 text-[13px] leading-relaxed text-foreground">
        <NoteIcon
          className="mt-0.5 size-3.5 shrink-0 text-primary-600 dark:text-primary-300"
          aria-hidden
        />
        {note}
      </p>
    </Card>
  );
}