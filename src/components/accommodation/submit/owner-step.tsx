'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { RELATIONSHIPS } from './constants';
import { FieldError, FormField, inputClass, radioDotClass, radioRowClass } from './form-field';
import type { SubmitAccommodationValues } from './schema';

export function OwnerStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SubmitAccommodationValues>();

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="rounded border border-warning/30 bg-warning-bg px-3.5 py-3 text-[13px] leading-relaxed text-warning-text">
        ℹ️ Only share contact information that is already publicly known or that you have permission to
        share.
      </div>

      <FormField label="Landlord / caretaker name">
        <input {...register('landlord_name')} className={inputClass} placeholder="e.g. Mr Okafor" />
      </FormField>

      <FormField label="Contact phone number" hint="We will use this to verify the property">
        <input {...register('landlord_phone')} className={inputClass} type="tel" placeholder="e.g. 08012345678" />
      </FormField>

      <FormField label="How do you know about this vacancy?" required>
        <Controller
          name="submitter_relationship"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {RELATIONSHIPS.map(rel => {
                const active = field.value === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => field.onChange(rel)}
                    className={radioRowClass(active)}
                  >
                    <span className={radioDotClass(active)}>
                      {active && <span className="text-[9px] leading-none text-primary-foreground">✓</span>}
                    </span>
                    {rel}
                  </button>
                );
              })}
            </div>
          )}
        />
        <FieldError message={errors.submitter_relationship?.message} />
      </FormField>
    </div>
  );
}