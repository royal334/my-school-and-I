'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Check, Info } from 'lucide-react';
import { ID_TYPES } from '../constants';
import { FormField, choiceDotClass, choiceRowClass } from './form-primitives';
import { DocUploadField } from './doc-upload-field';
import type { AgentApplicationValues } from '../schema';

export function VerificationStep({
  file,
  onFileSelect,
}: {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  const { control } = useFormContext<AgentApplicationValues>();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-info/25 bg-info-bg px-3.5 py-3 text-[13px] leading-relaxed text-info-text">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Identity verification helps us ensure the quality and legitimacy of agents on Campus&Me.
          Your documents are stored securely and never shared publicly.
        </p>
      </div>

      <FormField label="ID type">
        <Controller
          name="id_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {ID_TYPES.map(type => {
                const active = field.value === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => field.onChange(type)}
                    className={choiceRowClass(active)}
                  >
                    <span className={choiceDotClass(active)}>
                      {active && <Check className="size-2.5 text-primary-foreground" aria-hidden />}
                    </span>
                    {type}
                  </button>
                );
              })}

              {field.value && (
                <DocUploadField
                  label={`Upload your ${field.value}`}
                  file={file}
                  onSelect={onFileSelect}
                />
              )}
            </div>
          )}
        />
      </FormField>

      <p className="text-xs leading-relaxed text-muted-foreground">
        You can skip identity verification for now and submit it later. Your application will still
        be reviewed but verification speeds up approval.
      </p>
    </div>
  );
}