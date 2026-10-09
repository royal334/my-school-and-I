"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SubmitHeader } from "./submit-header";
import { STEPS } from "./submit-constants";
import { PropertyStep, PropertyFormData } from "./property-step";
import { OwnerStep, OwnerFormData } from "./owner-step";
import { FacilitiesStep, FacilitiesFormData } from "./facilities-step";
import { PhotosStep } from "./photos-step";
import { FormError, primaryButtonClass } from "@/components/agent/apply/form-primitives";
import { cn } from "@/lib/utils";
import { requestPageLoader } from "@/components/providers/page-loader";

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

const EMPTY_OWNER: OwnerFormData = {
  landlord_name: "",
  landlord_phone: "",
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
  const [step, setStep] = useState(0);
  const [propertyData, setPropertyData] = useState(EMPTY_PROPERTY);
  const [ownerData, setOwnerData] = useState(EMPTY_OWNER);
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
    if (step === 1) {
      if (!ownerData.landlord_name.trim()) return "Landlord/caretaker name is required";
      if (!ownerData.landlord_phone.trim()) return "Landlord/caretaker phone is required";
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

    if (step === 2) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/agent/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...propertyData,
            ...ownerData,
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
        setStep(3);
      } catch (e: any) {
        setError(e.message);
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
          <OwnerStep
            data={ownerData}
            onChange={(k, v) => setOwnerData((prev) => ({ ...prev, [k]: v }))}
          />
        )}
        {step === 2 && (
          <FacilitiesStep
            data={facilitiesData}
            onChange={(k, v) => setFacilitiesData((prev) => ({ ...prev, [k]: v }))}
          />
        )}
        {step === 3 && (
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

        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={submitting}
            className={cn(primaryButtonClass, "mt-6")}
          >
            {submitting ? "Submitting" : step === 2 ? "Submit property" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
