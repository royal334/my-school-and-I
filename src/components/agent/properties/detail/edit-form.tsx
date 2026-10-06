"use client";

import { useState } from "react";
import { FormField, inputClass, textareaClass } from "@/components/agent/apply/form-primitives";
import { ROOM_TYPES, Submission } from "../types";
import { cn } from "@/lib/utils";

interface EditFormProps {
  submission: Submission;
  onSaved: (updated: Submission) => void;
}

function TriToggle({ label, value, onChange }: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const opts = [
    { label: "Yes", val: true },
    { label: "No", val: false },
    { label: "Don't know", val: null as boolean | null },
  ];
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-2">
        {opts.map(({ label: l, val }) => {
          const active = value === val;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange(val)}
              className={[
                "flex-1 min-h-[36px] rounded-lg border text-xs transition-colors cursor-pointer",
                active
                  ? "border-primary bg-primary text-primary-foreground font-medium"
                  : "border-input bg-card text-foreground hover:border-primary/50",
              ].join(" ")}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EditForm({ submission, onSaved }: EditFormProps) {
  const [propertyName, setPropertyName] = useState(submission.property_name);
  const [area, setArea] = useState(submission.area);
  const [street, setStreet] = useState(submission.street || "");
  const [landmark, setLandmark] = useState(submission.landmark || "");
  const [unitNumber, setUnitNumber] = useState(submission.unit_number || "");
  const [roomType, setRoomType] = useState(submission.room_type);
  const [expectedPrice, setExpectedPrice] = useState(submission.expected_price?.toString() || "");
  const [availableFrom, setAvailableFrom] = useState(submission.available_from || "");
  const [additionalCharges, setAdditionalCharges] = useState(submission.additional_charges_note || "");
  const [landlordName, setLandlordName] = useState(submission.landlord_name || "");
  const [landlordPhone, setLandlordPhone] = useState(submission.landlord_phone || "");
  const [hasWater, setHasWater] = useState(submission.has_water);
  const [hasElec, setHasElec] = useState(submission.has_electricity);
  const [hasSec, setHasSec] = useState(submission.has_security);
  const [facilitiesNotes, setFacilitiesNotes] = useState(submission.facilities_notes || "");
  const [otherNotes, setOtherNotes] = useState(submission.other_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/agent/properties/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: propertyName,
          area,
          street: street || null,
          landmark: landmark || null,
          unit_number: unitNumber || null,
          room_type: roomType,
          expected_price: expectedPrice || null,
          available_from: availableFrom || null,
          additional_charges_note: additionalCharges || null,
          landlord_name: landlordName || null,
          landlord_phone: landlordPhone || null,
          has_water: hasWater,
          has_electricity: hasElec,
          has_security: hasSec,
          facilities_notes: facilitiesNotes || null,
          other_notes: otherNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.submission);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-xs leading-relaxed text-error-text">
        Editing this submission will resubmit it for review.
      </div>

      <input className={inputClass} placeholder="Property name *" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
      <input className={inputClass} placeholder="Area *" value={area} onChange={(e) => setArea(e.target.value)} />
      <input className={inputClass} placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
      <input className={inputClass} placeholder="Landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
      <input className={inputClass} placeholder="Unit number" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />

      <div className="flex flex-wrap gap-2">
        {ROOM_TYPES.map((type) => {
          const active = roomType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setRoomType(type)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-all",
                active
                  ? "border-primary bg-primary font-medium text-primary-foreground"
                  : "border-input bg-card text-foreground hover:border-primary/50 hover:bg-primary-50 dark:hover:bg-white/5"
              )}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <input className={inputClass} type="number" placeholder="Rent (NGN/yr)" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} />
        <input className={inputClass} type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
      </div>

      <input className={inputClass} placeholder="Additional charges note" value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} />
      <input className={inputClass} placeholder="Landlord name" value={landlordName} onChange={(e) => setLandlordName(e.target.value)} />
      <input className={inputClass} type="tel" placeholder="Landlord phone" value={landlordPhone} onChange={(e) => setLandlordPhone(e.target.value)} />

      <TriToggle label="Water?" value={hasWater} onChange={setHasWater} />
      <TriToggle label="Electricity?" value={hasElec} onChange={setHasElec} />
      <TriToggle label="Security?" value={hasSec} onChange={setHasSec} />

      <textarea className={textareaClass} placeholder="Facilities notes" rows={3} value={facilitiesNotes} onChange={(e) => setFacilitiesNotes(e.target.value)} />
      <textarea className={textareaClass} placeholder="Other notes" rows={2} value={otherNotes} onChange={(e) => setOtherNotes(e.target.value)} />

      {error && <p className="text-sm text-error-text">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-1 min-h-[44px] w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
