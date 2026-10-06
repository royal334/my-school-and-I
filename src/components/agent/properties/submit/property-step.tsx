"use client";

import { FormField } from "@/components/agent/apply/form-primitives";
import { inputClass } from "@/components/agent/apply/form-primitives";
import { ROOM_TYPES } from "./submit-constants";
import { cn } from "@/lib/utils";

export interface PropertyFormData {
  property_name: string;
  area: string;
  street: string;
  landmark: string;
  unit_number: string;
  room_type: string;
  expected_price: string;
  available_from: string;
  additional_charges_note: string;
}

interface PropertyStepProps {
  data: PropertyFormData;
  onChange: (k: keyof PropertyFormData, v: string) => void;
}

export function PropertyStep({ data, onChange }: PropertyStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <FormField label="Property / lodge name" required>
        <input
          className={inputClass}
          placeholder="e.g. XYZ Lodge"
          value={data.property_name}
          onChange={(e) => onChange("property_name", e.target.value)}
        />
      </FormField>

      <FormField label="Area / neighbourhood" required hint="e.g. Ifite-Awka, Agu-Awka">
        <input
          className={inputClass}
          placeholder="e.g. Ifite-Awka"
          value={data.area}
          onChange={(e) => onChange("area", e.target.value)}
        />
      </FormField>

      <FormField label="Street">
        <input
          className={inputClass}
          placeholder="e.g. No. 12 Unity Street"
          value={data.street}
          onChange={(e) => onChange("street", e.target.value)}
        />
      </FormField>

      <FormField label="Landmark" hint="e.g. Behind First Bank">
        <input
          className={inputClass}
          placeholder="e.g. Behind First Bank"
          value={data.landmark}
          onChange={(e) => onChange("landmark", e.target.value)}
        />
      </FormField>

      <FormField label="Unit / room number" hint="e.g. Room 102, Flat B">
        <input
          className={inputClass}
          placeholder="e.g. Room 102"
          value={data.unit_number}
          onChange={(e) => onChange("unit_number", e.target.value)}
        />
      </FormField>

      <FormField label="Room type" required>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => {
            const active = data.room_type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange("room_type", type)}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-all",
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
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Rent (NGN/yr)">
          <input
            className={inputClass}
            type="number"
            placeholder="e.g. 450000"
            value={data.expected_price}
            onChange={(e) => onChange("expected_price", e.target.value)}
          />
        </FormField>
        <FormField label="Available from">
          <input
            className={inputClass}
            type="date"
            value={data.available_from}
            onChange={(e) => onChange("available_from", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Additional charges" hint="e.g. light fee, generator fee, etc">
        <input
          className={inputClass}
          placeholder="e.g. light fee, etc"
          value={data.additional_charges_note}
          onChange={(e) => onChange("additional_charges_note", e.target.value)}
        />
      </FormField>
    </div>
  );
}
