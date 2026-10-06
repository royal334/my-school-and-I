'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { INPUT_CLASS, PRIMARY_BTN_CLASS, SECONDARY_BTN_CLASS, TEXTAREA_CLASS } from './constants';

export type PhotoChoice = 'submitted' | 'upload';

export interface CreatePropertyPayload {
  property: {
    name: string;
    area: string;
    street: string | null;
    landmark: string | null;
    landlord_name: string | null;
    landlord_phone: string | null;
  };
  unit: {
    unit_number: string | null;
    room_type: string;
    price: number | null;
    has_water: boolean;
    has_electricity: boolean;
    has_security: boolean;
  };
  adminNotes: string;
  photoChoice: PhotoChoice;
  photoFiles: File[];
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function FacilityToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="size-4 cursor-pointer accent-primary-600"
      />
      {label}
    </label>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

/** Turns an approved submission into a live property + unit record. Every field
 *  is prefilled from the lead so staff only correct what the reporter got wrong. */
export function LeadCreatePropertyForm({
  lead,
  loading,
  onSubmit,
  onCancel,
}: {
  lead: LeadDetail;
  loading: boolean;
  onSubmit: (payload: CreatePropertyPayload) => void;
  onCancel: () => void;
}) {
  const [property, setProperty] = useState({
    name: lead.property_name,
    area: lead.area,
    street: lead.street ?? '',
    landmark: lead.landmark ?? '',
    landlord_name: lead.landlord_name ?? '',
    landlord_phone: lead.landlord_phone ?? '',
  });
  const [unit, setUnit] = useState({
    unit_number: lead.unit_number ?? '',
    room_type: lead.room_type ?? '',
    price: lead.expected_price?.toString() ?? '',
    has_water: lead.has_water ?? false,
    has_electricity: lead.has_electricity ?? false,
    has_security: lead.has_security ?? false,
  });
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes ?? '');
  const [photoChoice, setPhotoChoice] = useState<PhotoChoice>('submitted');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState('');

  function setPropertyField(key: keyof typeof property, value: string) {
    setProperty(prev => ({ ...prev, [key]: value }));
  }

  function setUnitField(key: 'unit_number' | 'room_type' | 'price', value: string) {
    setUnit(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (photoChoice === 'upload' && photoFiles.length === 0) {
      setPhotoError('Choose at least one photo or video, or use the submitted photos instead.');
      return;
    }
    setPhotoError('');

    onSubmit({
      property: {
        name: property.name,
        area: property.area,
        street: property.street || null,
        landmark: property.landmark || null,
        landlord_name: property.landlord_name || null,
        landlord_phone: property.landlord_phone || null,
      },
      unit: {
        unit_number: unit.unit_number || null,
        room_type: unit.room_type,
        price: unit.price ? Number(unit.price) : null,
        has_water: unit.has_water,
        has_electricity: unit.has_electricity,
        has_security: unit.has_security,
      },
      adminNotes,
      photoChoice,
      photoFiles,
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-3.5">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Everything below is prefilled from the submission. Correct anything that is
        wrong, then confirm to publish the listing.
      </p>

      <FieldGroup title="Property">
        <Field label="Name" value={property.name} onChange={v => setPropertyField('name', v)} />
        <Field label="Area" value={property.area} onChange={v => setPropertyField('area', v)} />
        <Field label="Street" value={property.street} onChange={v => setPropertyField('street', v)} />
        <Field
          label="Landmark"
          value={property.landmark}
          onChange={v => setPropertyField('landmark', v)}
        />
        <Field
          label="Landlord name"
          value={property.landlord_name}
          onChange={v => setPropertyField('landlord_name', v)}
        />
        <Field
          label="Landlord phone"
          value={property.landlord_phone}
          onChange={v => setPropertyField('landlord_phone', v)}
        />
      </FieldGroup>

      <FieldGroup title="Unit / room">
        <Field
          label="Unit number"
          value={unit.unit_number}
          placeholder="e.g. Room 102"
          onChange={v => setUnitField('unit_number', v)}
        />
        <Field
          label="Room type"
          value={unit.room_type}
          onChange={v => setUnitField('room_type', v)}
        />
        <Field
          label="Price (₦/yr)"
          type="number"
          value={unit.price}
          onChange={v => setUnitField('price', v)}
        />

        <div className="flex flex-wrap gap-4 pt-1">
          <FacilityToggle
            label="Water"
            checked={unit.has_water}
            onChange={v => setUnit(prev => ({ ...prev, has_water: v }))}
          />
          <FacilityToggle
            label="Electricity"
            checked={unit.has_electricity}
            onChange={v => setUnit(prev => ({ ...prev, has_electricity: v }))}
          />
          <FacilityToggle
            label="Security"
            checked={unit.has_security}
            onChange={v => setUnit(prev => ({ ...prev, has_security: v }))}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Verified photos">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Do you want to add verified photos? If not, the photos already
          submitted with this lead are used as the listing&apos;s verified
          photos.
        </p>

        <label className="flex cursor-pointer items-start gap-2 text-[13px] text-foreground">
          <input
            type="radio"
            name="photo-choice"
            checked={photoChoice === 'submitted'}
            onChange={() => {
              setPhotoChoice('submitted');
              setPhotoError('');
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary-600"
          />
          <span>
            Use the submitted photos
            <span className="block text-[11px] text-muted-foreground">
              Nothing to upload — the lead&apos;s photos go live right away.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-[13px] text-foreground">
          <input
            type="radio"
            name="photo-choice"
            checked={photoChoice === 'upload'}
            onChange={() => setPhotoChoice('upload')}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary-600"
          />
          <span>
            Add verified photos
            <span className="block text-[11px] text-muted-foreground">
              Upload new photos or videos — these are what students will see.
            </span>
          </span>
        </label>

        {photoChoice === 'upload' && (
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-[1.5px] border-dashed border-primary-100 bg-primary-50/30 px-4 py-4 transition-colors hover:border-primary-500/50 dark:border-white/10">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={event => {
                  setPhotoFiles(Array.from(event.target.files || []));
                  setPhotoError('');
                }}
                className="hidden"
              />
              <span className="text-[13px] font-medium text-primary-600">
                + Choose photos or videos
              </span>
              <span className="text-[11px] text-muted-foreground">
                Select one or more files
              </span>
            </label>

            {photoFiles.length > 0 && (
              <ul className="flex flex-col gap-1">
                {photoFiles.map((file, index) => (
                  <li
                    key={`${file.name}_${index}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-[12px] text-foreground"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setPhotoFiles(prev => prev.filter((_, idx) => idx !== index))
                      }
                      className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-error"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {photoError && <p className="text-[13px] text-error">{photoError}</p>}
      </FieldGroup>

      <FieldGroup title="Internal note">
        <textarea
          rows={2}
          value={adminNotes}
          placeholder="Optional note saved alongside the listing"
          onChange={event => setAdminNotes(event.target.value)}
          className={TEXTAREA_CLASS}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={loading} className={PRIMARY_BTN_CLASS}>
          {loading ? 'Creating…' : 'Review and confirm listing'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className={SECONDARY_BTN_CLASS}>
          Cancel
        </button>
      </div>
    </div>
  );
}