import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CampusMeLogo } from '@/components/brand/logo';

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocumentProps {
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, summary, updatedAt, sections }: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" aria-label="Campus&Me home">
            <CampusMeLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Campus&Me</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
            Campus&Me / Legal
          </p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{summary}</p>
          <p className="mt-5 text-sm text-muted-foreground">Last updated: {updatedAt}</p>
        </div>

        <details className="mt-9 border-y border-border py-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">On this page</summary>
          <nav aria-label="On this page" className="mt-4 grid gap-3 sm:grid-cols-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm leading-6 text-muted-foreground hover:text-primary-700"
              >
                <span className="mr-2 font-mono text-xs text-primary-500">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </details>

        <div className="mt-10 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-8 border-l border-border pl-4">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                On this page
              </p>
              <ol className="space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[13px] leading-5 text-muted-foreground transition-colors hover:text-primary-700"
                    >
                      <span className="mr-2 font-mono text-[11px] text-primary-500">{String(index + 1).padStart(2, '0')}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 border-t border-border py-8 first:border-t-0 first:pt-0 sm:py-9"
              >
                <p className="mb-2 font-mono text-xs text-primary-600">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-muted-foreground">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="list-disc space-y-2 pl-5 marker:text-primary-500">
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <div className="border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
              Questions about this document? Contact{' '}
              <a className="font-medium text-primary-700 underline underline-offset-4" href="mailto:support@campusandme.com">
                support@campusandme.com
              </a>{' '}
              or call{' '}
              <a className="font-medium text-primary-700 underline underline-offset-4" href="tel:+2349110224171">
                +234 911 022 4171
              </a>
              .
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}