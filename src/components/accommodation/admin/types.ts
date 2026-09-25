export interface UnitProperty {
  id: string;
  name: string;
  area: string;
  street: string | null;
  landmark: string | null;
  landlord_name: string | null;
  landlord_phone: string | null;
  caretaker_name: string | null;
  caretaker_phone: string | null;
}

export interface UnitVerification {
  id: string;
  verified_at: string;
  verification_result: string;
  verified_by: string;
  notes: string | null;
  location_confirmed: boolean;
  owner_confirmed: boolean;
  price_confirmed: boolean;
  availability_confirmed: boolean;
  photos_confirmed: boolean;
  facilities_confirmed: boolean;
}

export interface UnitMedia {
  id: string;
  file_path: string;
  file_type: string;
  is_cover: boolean;
  display_order: number;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string | null;
  room_type: string;
  price: number | null;
  additional_charges: number | null;
  additional_charges_note: string | null;
  availability_status: string;
  available_from: string | null;
  last_verified_at: string | null;
  verification_due_at: string | null;
  has_water: boolean;
  has_electricity: boolean;
  has_security: boolean;
  has_parking: boolean;
  is_furnished: boolean;
  toilet_bathroom: string | null;
  facilities_notes: string | null;
  property: UnitProperty;
  verifications: UnitVerification[];
  media: UnitMedia[];
}