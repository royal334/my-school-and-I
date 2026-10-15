"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SubmitHeader } from "./submit-header";

import { PropertyStep, PropertyFormData } from "./property-step";

import { FacilitiesStep, FacilitiesFormData } from "./facilities-step";
import { PhotosStep } from "./photos-step";
import { FormError, primaryButtonClass } from "@/components/agent/apply/form-primitives";
import { cn } from "@/lib/utils";
import { requestPageLoader } from "@/components/providers/page-loader";
import { usePostHogAnalytics } from "@/hooks/posthog-events";
import { POSTHOG_EVENTS } from "@/utils/constants/constants";

const EMPTY_PROPERTY: PropertyFormData = {
  property_name: "",
  area: "",
  street: "",
  landmark: "",
  unit_number: "",
  room_type: "",
  expected_price: "",
  available_from: "",
  additional_charges_note: "",
};



const EMPTY_FACILITIES: FacilitiesFormData = {
  has_water: null,
  has_electricity: null,
  has_security: null,
  facilities_notes: "",
  other_notes: "",
};

export function SubmitForm() {
  const router = useRouter();
  const { track } = usePostHogAnalytics();
  const [step, setStep] = useState(0);
  const [propertyData, setPropertyData] = useState(EMPTY_PROPERTY);

  const [facilitiesData, setFacilitiesData] = useState(EMPTY_FACILITIES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!propertyData.property_name.trim()) return "Property name is required";
      if (!propertyData.area.trim()) return "Area is required";
      if (!propertyData.room_type) return "Select a room type";
    }

    return null;
  }

  async function handleNext() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");

    if (step === 1) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/agent/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...propertyData,
            landlord_name: null,
            landlord_phone: null,
            ...facilitiesData,
            expected_price: propertyData.expected_price || null,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          if (result.error === "duplicate_submission") {
            setError(result.message);
            return;
          }
          throw new Error(result.message || result.error);
        }
        setSubmissionId(result.submission.id);
        track(POSTHOG_EVENTS.agentPropertySubmitted, {
          submission_id: result.submission.id,
          area: propertyData.area,
          room_type: propertyData.room_type,
        });
        setStep(2);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((s) => s + 1);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []).slice(0, 10);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function handleUpload() {
    if (!submissionId) return;

    if (files.length === 0) {
      requestPageLoader();
      router.push(`/agent/properties/${submissionId}`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `submissions/${submissionId}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("accommodation-media")
        .upload(path, file);

      if (!uploadError && user) {
        await supabase.from("accommodation_media").insert({
          submission_id: submissionId,
          file_path: path,
          file_name: file.name,
          file_type: file.type.startsWith("video/") ? "video" : "image",
          media_source: "submission",
          display_order: i,
          is_cover: i === 0,
          uploaded_by: user.id,
        });
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    requestPageLoader();
    router.push(`/agent/properties/${submissionId}`);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SubmitHeader step={step} onBack={handleBack} />

      <div className="px-4 pt-5">
        {step === 0 && (
          <PropertyStep
            data={propertyData}
            onChange={(k, v) => setPropertyData((prev) => ({ ...prev, [k]: v }))}
          />
        )}
        {step === 1 && (
          <FacilitiesStep
            data={facilitiesData}
            onChange={(k, v) => setFacilitiesData((prev) => ({ ...prev, [k]: v }))}
          />
        )}
        {step === 2 && (
          <PhotosStep
            submissionId={submissionId}
            files={files}
            previews={previews}
            uploading={uploading}
            uploadProgress={uploadProgress}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
          />
        )}

        {error && <FormError message={error} />}

        {step < 2 && (
          <button
            onClick={handleNext}
            disabled={submitting}
            className={cn(primaryButtonClass, "mt-6")}
          >
            {submitting ? "Submitting" : step === 1 ? "Submit property" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
