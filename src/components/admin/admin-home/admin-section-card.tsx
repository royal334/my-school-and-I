import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { AdminSection } from './constants';

export function AdminSectionCard({ section }: { section: AdminSection }) {
  const Icon = section.icon;

  return (
    <Link
      href={section.href}
      className="group block rounded-2xl border border-border bg-card p-5 no-underline transition-all duration-150 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-500/15 dark:text-primary-300 dark:group-hover:bg-primary-500/25">
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-foreground">{section.title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        </div>

        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {section.features.map((feature) => (
          <li
            key={feature}
            className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}
