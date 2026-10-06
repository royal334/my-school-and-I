"use client";

import Link from "next/link";
import { ArrowLeft } from 'lucide-react'

interface PropertiesHeaderProps {
  count: number;
  needsAttention: number;

}

export function PropertiesHeader({ count, needsAttention }: PropertiesHeaderProps) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
          <Link
          aria-label="Go back"
          href="/agent"
          className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
        >
            <ArrowLeft className="size-4.5" aria-hidden />
            </Link>
            <h1 className="text-lg tracking-tight text-white">My properties</h1>
          </div>
          <p className="text-xs text-primary-200 dark:text-primary-300">
            {count} submission{count !== 1 ? "s" : ""}
            {needsAttention > 0 &&
              ` ${needsAttention} need${needsAttention === 1 ? "s" : ""} attention`}
          </p>
        </div>
        <Link href="/agent/properties/submit">
          <button className="min-h-[36px] cursor-pointer rounded-lg bg-accent-500 px-3.5 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-400 dark:bg-accent-400 dark:text-accent-950 dark:hover:bg-accent-300">
            + Submit
          </button>
        </Link>
      </div>
    </header>
  );
}
