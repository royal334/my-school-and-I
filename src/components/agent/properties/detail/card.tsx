"use client";

import { cn } from "@/lib/utils";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground">{children}</h3>;
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
