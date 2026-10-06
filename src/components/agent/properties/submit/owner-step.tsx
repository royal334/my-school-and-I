"use client";

import { FormField, inputClass } from "@/components/agent/apply/form-primitives";

export interface OwnerFormData {
  landlord_name: string;
  landlord_phone: string;
}

interface OwnerStepProps {
  data: OwnerFormData;
  onChange: (k: keyof OwnerFormData, v: string) => void;
}

export function OwnerStep({ data, onChange }: OwnerStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-primary/20 bg-primary-50/70 px-3.5 py-3 text-sm leading-relaxed text-primary-800 dark:border-primary/30 dark:bg-primary-950/30 dark:text-primary-200">
        As an agent, we expect you to have direct contact with the landlord or caretaker. This
        information will be used by our team during verification.
      </div>

      <FormField label="Landlord / caretaker name" required>
        <input
          className={inputClass}
          placeholder="e.g. Mr Okafor"
          value={data.landlord_name}
          onChange={(e) => onChange("landlord_name", e.target.value)}
        />
      </FormField>

      <FormField label="Landlord / caretaker phone" required>
        <input
          className={inputClass}
          type="tel"
          placeholder="e.g. 08012345678"
          value={data.landlord_phone}
          onChange={(e) => onChange("landlord_phone", e.target.value)}
        />
      </FormField>
    </div>
  );
}
