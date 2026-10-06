"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "../types";

interface DetailHeaderProps {
  status: string;
  onBack: () => void;
}

export function DetailHeader({ status, onBack }: DetailHeaderProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <header className={cn("px-4 py-4", cfg.bg)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-foreground/70 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg tracking-tight text-foreground">Property submission</h1>
          <p className={cn("text-xs", cfg.color)}>{cfg.label}</p>
        </div>
        <Link href="/agent/properties">
          <span className="text-xs font-medium text-primary">All properties</span>
        </Link>
      </div>
    </header>
  );
}
