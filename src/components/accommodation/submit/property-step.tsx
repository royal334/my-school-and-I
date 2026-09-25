'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { ROOM_TYPES } from './constants';
import { FieldError, FormField, chipClass, inputClass } from './form-field';
import type { SubmitAccommodationValues } from './schema';

export function PropertyStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SubmitAccommodationValues>();

  return (
    <div className="flex flex-col gap-[18px]">
      <FormField label="Property / lodge name" required hint="e.g. XYZ Lodge, ABC Hostel">
        <input {...register('property_name')} className={inputClass} placeholder="e.g. XYZ Lodge" />
        <FieldError message={errors.property_name?.message} />
      </FormField>

      <FormField label="Area / neighbourhood" required hint="e.g. Ifite-Awka, Agu-Awka">
        <input {...register('area')} className={inputClass} placeholder="e.g. Ifite-Awka" />
        <FieldError message={errors.area?.message} />
      </FormField>

      <FormField label="Street" hint="Optional but helpful">
        <input {...register('street')} className={inputClass} placeholder="e.g. No. 12 Unity Street" />
      </FormField>

      <FormField label="Nearby landmark" hint="e.g. Behind First Bank, Opposite Post Office">
        <input {...register('landmark')} className={inputClass} placeholder="e.g. Behind First Bank" />
      </FormField>

      <FormField label="Room / unit number" hint="If you know it — e.g. Room 102, Flat B">
        <input {...register('unit_number')} className={inputClass} placeholder="e.g. Room 102" />
      </FormField>

      <FormField label="Room type" required>
        <Controller
          name="room_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => field.onChange(type)}
                  className={chipClass(field.value === type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        />
        <FieldError message={errors.room_type?.message} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Expected rent (₦/yr)" hint="Annual rent">
          <input {...register('expected_price')} className={inputClass} type="number" placeholder="e.g. 450000" />
        </FormField>

        <FormField label="Available from">
          <input {...register('available_from')} className={inputClass} type="date" />
        </FormField>
      </div>

      <FormField label="Additional charges" hint="Agency fee, caution fee, service charge etc.">
        <input {...register('additional_charges_note')} className={inputClass} placeholder="e.g. ₦50k agency fee" />
      </FormField>
    </div>
  );
}