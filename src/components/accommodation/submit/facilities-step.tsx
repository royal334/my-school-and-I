'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { FormField, textareaClass } from './form-field';
import { TriToggle } from './tri-toggle';
import type { SubmitAccommodationValues } from './schema';

export function FacilitiesStep() {
  const { register, control } = useFormContext<SubmitAccommodationValues>();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Share what you know about the facilities. It&apos;s fine if you&apos;re not sure — our team will verify.
      </p>

      <Controller
        name="has_water"
        control={control}
        render={({ field }) => (
          <TriToggle label="Water available?" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        name="has_electricity"
        control={control}
        render={({ field }) => (
          <TriToggle label="Electricity available?" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        name="has_security"
        control={control}
        render={({ field }) => (
          <TriToggle label="Security?" value={field.value} onChange={field.onChange} />
        )}
      />

      <FormField label="Facilities notes" hint="Anything else about water, electricity, security, toilets etc.">
        <textarea
          {...register('facilities_notes')}
          className={textareaClass}
          rows={3}
          placeholder="e.g. Borehole water, EEDC supply but has gen backup…"
        />
      </FormField>

      <FormField label="Other notes" hint="Anything else CampusHub should know">
        <textarea
          {...register('other_notes')}
          className={textareaClass}
          rows={3}
          placeholder="e.g. Landlord is friendly, good neighbourhood…"
        />
      </FormField>
    </div>
  );
}