import * as z from 'zod';

export const accommodationSubmissionSchema = z.object({
  // Step 1 - Property
  property_name: z.string().trim().min(1, 'Property name is required'),
  area: z.string().trim().min(1, 'Area is required'),
  street: z.string(),
  landmark: z.string(),
  unit_number: z.string(),
  room_type: z.string().min(1, 'Select a room type'),
  expected_price: z.string(),
  available_from: z.string(),
  additional_charges_note: z.string(),

  // Step 2 - Owner Info
  landlord_name: z.string(),
  landlord_phone: z.string(),
  submitter_relationship: z.string().min(1, 'Tell us how you know about this vacancy'),

  // Step 3 - Facilities
  has_water: z.boolean().nullable(),
  has_electricity: z.boolean().nullable(),
  has_security: z.boolean().nullable(),
  facilities_notes: z.string(),
  other_notes: z.string(),
});

export type SubmitAccommodationValues = z.infer<typeof accommodationSubmissionSchema>;

export const defaultValues: SubmitAccommodationValues = {
  property_name: '',
  area: '',
  street: '',
  landmark: '',
  unit_number: '',
  room_type: '',
  expected_price: '',
  available_from: '',
  additional_charges_note: '',
  landlord_name: '',
  landlord_phone: '',
  submitter_relationship: '',
  has_water: null,
  has_electricity: null,
  has_security: null,
  facilities_notes: '',
  other_notes: '',
};

// Fields validated as each step is passed (zodResolver only checks these).
export const STEP_FIELDS: Record<number, (keyof SubmitAccommodationValues)[]> = {
  0: ['property_name', 'area', 'room_type'],
  1: ['submitter_relationship'],
  2: [],
};