import Link from 'next/link';
import { ArrowRight, Mail, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, type AgentStatusCta, type AgentStatusTone } from '../status-meta';

export function ApplicationStatusCard({
  tone,
  icon: Icon,
  title,
  description,
  feedback,
  cta,
}: {
  tone: AgentStatusTone;
  icon: LucideIcon;
  title: string;
  description: string;
  feedback?: string | null;
  cta?: AgentStatusCta;
}) {
  const classes = TONE_CLASSES[tone];

  const ctaClass = cn(
    'mt-4 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-6 text-sm font-medium text-white no-underline transition-colors',
    classes.solid,
  );

  return (
    <section className={cn('rounded-2xl border p-5 text-center', classes.card)}>
      <span
        className={cn(
          'mx-auto mb-3 flex size-14 items-center justify-center rounded-full',
          classes.icon,
        )}
      >
        <Icon className="size-7" aria-hidden />
      </span>

      <h2 className="text-xl tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {feedback && (
        <div className="mt-4 rounded-xl border border-border bg-card/70 p-3.5 text-left">
          <p
            className={cn(
              'mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
              classes.badge,
            )}
          >
            Feedback from Campus&amp;Me
          </p>
          <p className="text-[13px] leading-relaxed text-foreground">{feedback}</p>
        </div>
      )}

      {cta && 'href' in cta && (
        <Link href={cta.href} className={ctaClass}>
          {cta.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      {cta && 'mailto' in cta && (
        <a href={`mailto:${cta.mailto}`} className={ctaClass}>
          <Mail className="size-4" aria-hidden />
          {cta.label}
        </a>
      )}
    </section>
  );
}