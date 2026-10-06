"use client";

import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "../types";

interface StatusCardProps {
  status: string;
  adminNotes?: string | null;
}

export function StatusCard({ status, adminNotes }: StatusCardProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <section className={cn("rounded-2xl border p-4", cfg.border, cfg.bg)}>
      <h2 className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</h2>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{cfg.desc}</p>
      {status === "correction_required" && adminNotes && (
        <div className="mt-3 rounded-lg bg-error/5 px-3 py-2.5 text-sm leading-relaxed text-error-text">
          <strong>Admin feedback:</strong> {adminNotes}
        </div>
      )}
    </section>
  );
}
