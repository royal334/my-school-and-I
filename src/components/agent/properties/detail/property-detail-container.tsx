"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Submission } from "../types";
import { DetailHeader } from "./detail-header";
import { StatusCard } from "./status-card";
import { Card, SectionTitle, InfoRow } from "./card";
import { MediaSection } from "./media-section";
import { EditForm } from "./edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function triLabel(v: boolean | null) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "Don't know";
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(p);
}

export function PropertyDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/agent/properties/${id}`);
        if (res.status === 404) {
          router.replace("/agent/properties");
          return;
        }
        const d = await res.json();
        setSubmission(d.submission);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.id === d.submission?.agent_id) {
          setCanEdit(true);
        }
        if (d.submission?.status === "correction_required") {
          setCanEdit(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-muted px-4 py-6" />
        <div className="flex flex-col gap-3.5 px-4 pt-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const media = submission.media || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <DetailHeader status={submission.status} onBack={() => router.back()} />

      <div className="flex flex-col gap-3.5 px-4 pt-4">
        <StatusCard status={submission.status} adminNotes={submission.admin_notes} />

        <div className="flex flex-col gap-2.5">
          {canEdit && (
            <button
              onClick={() => setShowEdit(!showEdit)}
              className={cn(
                "min-h-[44px] w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                showEdit
                  ? "border border-primary/40 bg-primary-50 text-primary dark:bg-primary-950/40 dark:text-primary-200"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {showEdit ? "Cancel editing" : "Edit submission"}
            </button>
          )}

          {submission.status === "approved" && submission.matched_unit_id && (
            <Link href={`/dashboard/accommodation/${submission.matched_unit_id}`}>
              <button className="min-h-[44px] w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                View live listing ?
              </button>
            </Link>
          )}
        </div>

        {showEdit ? (
          <Card>
            <SectionTitle>Edit submission</SectionTitle>
            <EditForm
              submission={submission}
              onSaved={(updated) => {
                setSubmission({ ...submission, ...updated });
                setShowEdit(false);
              }}
            />
          </Card>
        ) : (
          <>
            <Card>
              <SectionTitle>Property details</SectionTitle>
              <InfoRow label="Property name" value={submission.property_name} />
              <InfoRow label="Area" value={submission.area} />
              <InfoRow label="Street" value={submission.street} />
              <InfoRow label="Landmark" value={submission.landmark} />
              <InfoRow label="Unit number" value={submission.unit_number} />
              <InfoRow label="Room type" value={submission.room_type} />
              <InfoRow
                label="Expected rent"
                value={submission.expected_price ? formatPrice(submission.expected_price) + "/yr" : null}
              />
              <InfoRow
                label="Available from"
                value={submission.available_from ? format(new Date(submission.available_from), "MMMM yyyy") : null}
              />
              <InfoRow label="Additional charges" value={submission.additional_charges_note} />
            </Card>

            <Card>
              <SectionTitle>Owner / caretaker</SectionTitle>
              <InfoRow label="Name" value={submission.landlord_name} />
              <InfoRow label="Phone" value={submission.landlord_phone} />
            </Card>

            <Card>
              <SectionTitle>Facilities</SectionTitle>
              <InfoRow label="Water" value={triLabel(submission.has_water)} />
              <InfoRow label="Electricity" value={triLabel(submission.has_electricity)} />
              <InfoRow label="Security" value={triLabel(submission.has_security)} />
              {submission.facilities_notes && (
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {submission.facilities_notes}
                </p>
              )}
              {submission.other_notes && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <strong>Other:</strong> {submission.other_notes}
                </p>
              )}
            </Card>

            <Card>
              <SectionTitle>Photos ({media.length})</SectionTitle>
              <MediaSection media={media} />
            </Card>
          </>
        )}

        <Card>
          <SectionTitle>Timeline</SectionTitle>
          <InfoRow
            label="Submitted"
            value={formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
          />
          <InfoRow
            label="Last updated"
            value={formatDistanceToNow(new Date(submission.updated_at), { addSuffix: true })}
          />
        </Card>
      </div>
    </div>
  );
}
