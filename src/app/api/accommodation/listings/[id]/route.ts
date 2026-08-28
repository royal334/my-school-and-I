// app/api/accommodation/listings/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // Fetch unit with property details
    const { data: unit, error } = await supabase
      .from('accommodation_units')
      .select(`
        *,
        property:accommodation_properties (*)
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

    return NextResponse.json({
      listing: {
        ...unit,
        media: media || [],
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