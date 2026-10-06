"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Submission, STATUS_CONFIG } from "./types";

interface PropertyCardProps {
  submission: Submission;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(p);
}

export function PropertyCard({ submission }: PropertyCardProps) {
  const cfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;

  const thumbSrc = submission.cover_image?.url || submission.cover_image?.file_path || submission.media?.find((m) => m.is_cover)?.url || submission.media?.find((m) => m.is_cover)?.file_path;

  return (
    <Link href={`/agent/properties/${submission.id}`} className="block no-underline">
      <article
        className={cn(
          "overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md",
          submission.status === "correction_required" ? "border-error/30" : "border-border"
        )}
      >
        <div className={cn("flex items-center justify-between px-3.5 py-2", cfg.bg)}>
          <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className="flex gap-3 p-3.5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xl">
            {thumbSrc ? (
              <img
                src={thumbSrc}
                alt={submission.property_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>??</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-0.5 truncate text-sm font-medium text-foreground">
              {submission.property_name}
            </p>
            <p className="mb-1 text-xs text-muted-foreground">
              ?? {submission.area} {submission.room_type}
              {submission.expected_price && ` ${formatPrice(submission.expected_price)}/yr`}
            </p>
            <p className={cn("text-xs", cfg.color)}>{cfg.desc}</p>

            {submission.status === "correction_required" && submission.admin_notes && (
              <div className="mt-2 rounded-md bg-error/5 px-2.5 py-2 text-xs leading-relaxed text-error-text">
                <strong>Admin:</strong> {submission.admin_notes}
              </div>
            )}

            {submission.status === "approved" && submission.matched_unit_id && (
              <p className="mt-1.5 text-xs font-medium text-success-text">
                View live listing ?
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
