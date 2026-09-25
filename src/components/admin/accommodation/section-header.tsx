import Link from 'next/link';

export function SectionHeader({ title, href, count }: { title: string; href: string; count?: number }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-primary-600 dark:text-white">
        {title}
        {count !== undefined && (
          <span className="ml-1 rounded-full bg-primary-50 px-1.5 py-0.5 text-[11px] font-normal text-primary-500 dark:bg-white/10 dark:text-primary-300">
            {count}
          </span>
        )}
      </h2>
      <Link href={href} className="text-xs font-medium text-primary-500 no-underline dark:text-primary-300">
        See all →
      </Link>
    </div>
  );
}