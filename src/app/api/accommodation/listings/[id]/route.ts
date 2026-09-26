// app/api/accommodation/listings/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withAccommodationMediaUrls } from '@/utils/lib/accommodation-media';

const SERVICE_FEE_MULTIPLIER = 1.2;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: unit, error } = await supabase
      .from('accommodation_units')
      .select(`
        id,
        room_type,
        price,
        additional_charges,
        additional_charges_note,
        availability_status,
        available_from,
        last_verified_at,
        has_water,
        has_electricity,
        has_security,
        has_parking,
        is_furnished,
        toilet_bathroom,
        facilities_notes,
        property:accommodation_properties (id, area, landmark)
      `)
      .eq('id', id)
      .eq('availability_status', 'available')
      .single();

    if (error || !unit) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Fetch all verified media for this unit
    const { data: media } = await supabase
      .from('accommodation_media')
      .select('id, file_path, file_name, file_type, is_cover, display_order')
      .eq('unit_id', id)
      .eq('media_source', 'verified')
      .order('display_order', { ascending: true });

    // Fetch latest verification record
    const { data: verification } = await supabase
      .from('accommodation_verifications')
      .select('verified_at, location_confirmed, owner_confirmed, price_confirmed, availability_confirmed, photos_confirmed, facilities_confirmed')
      .eq('unit_id', id)
      .order('verified_at', { ascending: false })
      .limit(1)
      .single();

    const mediaWithUrls = await withAccommodationMediaUrls(supabase, media || []);

    return NextResponse.json({
      listing: {
        ...unit,
        price: Math.round(Number(unit.price) * SERVICE_FEE_MULTIPLIER),
        media: mediaWithUrls,
        verification: verification || null,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch listing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}