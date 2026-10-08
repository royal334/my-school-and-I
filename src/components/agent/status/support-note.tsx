import { LifeBuoy } from 'lucide-react';

const SUPPORT_EMAIL = 'support@campusandme.com';

export function SupportNote({ email = SUPPORT_EMAIL }: { email?: string }) {
  return (
    <p className="flex items-center justify-center gap-1.5 px-4 py-2 text-center text-xs leading-relaxed text-muted-foreground">
      <LifeBuoy className="size-3.5 shrink-0" aria-hidden />
      <span>
        Questions? Contact{' '}
        <a
          href={`mailto:${email}`}
          className="font-medium text-primary-600 hover:underline dark:text-primary-300"
        >
          {email}
        </a>{' '}
        or call{' '}
        <a
          href="tel:+2349110224171"
          className="font-medium text-primary-600 hover:underline dark:text-primary-300"
        >
          +234 911 022 4171
        </a>
      </span>
    </p>
  );
}