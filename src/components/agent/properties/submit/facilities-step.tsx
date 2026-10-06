"use client";

import { FormField, inputClass, textareaClass } from "@/components/agent/apply/form-primitives";
import { TriToggle } from "./tri-toggle";

export interface FacilitiesFormData {
  has_water: boolean | null;
  has_electricity: boolean | null;
  has_security: boolean | null;
  facilities_notes: string;
  other_notes: string;
}

interface FacilitiesStepProps {
  data: FacilitiesFormData;
  onChange: (k: keyof FacilitiesFormData, v: any) => void;
}

export function FacilitiesStep({ data, onChange }: FacilitiesStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        As an agent you should know these details. Our team will confirm during inspection.
      </p>

      <TriToggle label="Water available?" value={data.has_water} onChange={(v) => onChange("has_water", v)} />
      <TriToggle label="Electricity available?" value={data.has_electricity} onChange={(v) => onChange("has_electricity", v)} />
      <TriToggle label="Security?" value={data.has_security} onChange={(v) => onChange("has_security", v)} />

      <FormField label="Facilities notes">
        <textarea
          className={textareaClass}
          placeholder="e.g. Borehole water, EEDC supply with gen backup"
          rows={3}
          value={data.facilities_notes}
          onChange={(e) => onChange("facilities_notes", e.target.value)}
        />
      </FormField>

      <FormField label="Other notes">
        <textarea
          className={textareaClass}
          placeholder="Any other information Campus&Me should know"
          rows={2}
          value={data.other_notes}
          onChange={(e) => onChange("other_notes", e.target.value)}
        />
      </FormField>
    </div>
  );
}
