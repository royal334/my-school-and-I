import Link from 'next/link';

export function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="no-underline">
      <div className="cursor-pointer rounded-xl border border-[#D6E5DF] bg-white p-4 shadow-[0_1px_4px_rgba(26,60,52,0.08)] transition-shadow duration-150 hover:shadow-[0_4px_12px_rgba(26,60,52,0.1)] dark:border-white/10 dark:bg-card dark:hover:shadow-black/20">
        <p className={`font-mono text-[28px] font-medium leading-none ${color}`}>{value}</p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">{label}</p>
      </div>
    </Link>
  );
}