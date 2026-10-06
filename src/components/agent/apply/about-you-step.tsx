'use client';

import { useFormContext } from 'react-hook-form';
import { FieldError, FormField, inputClass } from './form-primitives';
import type { AgentApplicationValues } from '../schema';

export function AboutYouStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AgentApplicationValues>();

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label="Full name / Agency name"
        required
        htmlFor="agent-display-name"
      >
        <input
          id="agent-display-name"
          {...register('display_name')}
          className={inputClass}
          placeholder="e.g. Chukwudi Okafor or Okafor Properties"
          autoComplete="name"
        />
        <FieldError message={errors.display_name?.message} />
      </FormField>

      <FormField label="Phone number" required htmlFor="agent-phone">
        <input
          id="agent-phone"
          {...register('phone_number')}
          className={inputClass}
          type="tel"
          inputMode="tel"
          placeholder="e.g. 08012345678"
          autoComplete="tel"
        />
        <FieldError message={errors.phone_number?.message} />
      </FormField>
    </div>
  );
}