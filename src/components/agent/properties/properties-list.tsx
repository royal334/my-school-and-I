"use client";

import Link from "next/link";
import { FILTERS, Submission } from "./types";
import { PropertyCard } from "./property-card";
// import { Skeleton } from "@/components/ui/skeleton";

interface PropertiesListProps {
  loading: boolean;
  submissions: Submission[];
  filter: string;
}

export function PropertiesList({ loading, submissions, filter }: PropertiesListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border bg-card"
          />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    const filterLabel = FILTERS.find((f) => f.key === filter)?.label.toLowerCase() || "";
    return (
      <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
        <span className="text-5xl">??</span>
        <h2 className="text-xl tracking-tight text-foreground">
          No {filterLabel} submissions yet
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Submit your first property and start earning commissions when students rent through Campus&Me.
        </p>
        <Link href="/agent/properties/submit">
          <button className="min-h-[44px] cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Submit first property
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5">
      {submissions.map((s) => (
        <PropertyCard key={s.id} submission={s} />
      ))}
    </div>
  );
}
