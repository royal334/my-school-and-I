'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Check } from 'lucide-react';
import { OPERATING_AREAS } from '../constants';
import { FieldError, FormField, chipClass, textareaClass } from './form-primitives';
import type { AgentApplicationValues } from '../schema';

export function AreasBioStep() {
  const { control, register, formState: { errors } } = useFormContext<AgentApplicationValues>();

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label="Operating areas"
        required
        hint="Select all areas where you have accommodation listings."
      >
        <Controller
          name="operating_areas"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {OPERATING_AREAS.map(area => {
                const active = field.value.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      field.onChange(
                        active
                          ? field.value.filter(a => a !== area)
                          : [...field.value, area],
                      )
                    }
                    className={chipClass(active)}
                  >
                    {active && <Check className="mr-1 inline size-3" aria-hidden />}
                    {area}
                  </button>
                );
              })}
            </div>
          )}
        />
        <FieldError message={errors.operating_areas?.message} />
      </FormField>

      <FormField
        label="Tell us about yourself"
        hint="How long have you been in accommodation? How many properties do you manage?"
      >
        <textarea
          {...register('bio')}
          className={textareaClass}
          rows={4}
          placeholder="How long have you been in accommodation? How many properties do you manage? Any other relevant experience…"
        />
      </FormField>
    </div>
  );
}