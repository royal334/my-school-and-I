export interface Property {
  id: string;
  name: string;
  area: string;
  street: string;
  landmark: string;
}

export interface MediaItem {
  id: string;
  file_path: string;
  file_type: string;
  is_cover: boolean;
}

export interface Verification {
  verified_at: string;
  location_confirmed: boolean;
  owner_confirmed: boolean;
  price_confirmed: boolean;
  availability_confirmed: boolean;
  photos_confirmed: boolean;
  facilities_confirmed: boolean;
}

export interface Listing {
  id: string;
  unit_number: string;
  room_type: string;
  price: number;
  additional_charges: number;
  additional_charges_note?: string;
  availability_status: string;
  available_from: string;
  last_verified_at: string;
  has_water: boolean;
  has_electricity: boolean;
  has_security: boolean;
  has_parking: boolean;
  is_furnished: boolean;
  toilet_bathroom?: string;
  facilities_notes?: string;
  property: Property;
  cover_image?: { file_path: string } | null;
  media?: MediaItem[];
  verification?: Verification | null;
}