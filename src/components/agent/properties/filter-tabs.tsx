"use client";

import { FILTERS } from "./types";
import { cn } from "@/lib/utils";

interface FilterTabsProps {
  active: string;
  onChange: (key: string) => void;
}

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="mt-3 border-b border-border bg-card">
      <div className="flex overflow-x-auto px-4 custom-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={cn(
              "flex-shrink-0 cursor-pointer px-3.5 py-3 text-sm transition-colors whitespace-nowrap",
              active === f.key
                ? "border-b-2 border-primary font-semibold text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
