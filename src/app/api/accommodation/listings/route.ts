// app/api/accommodation/listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const room_type = searchParams.get('room_type') || '';
    const area = searchParams.get('area') || '';
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const has_water = searchParams.get('has_water');
    const has_electricity = searchParams.get('has_electricity');
    const has_security = searchParams.get('has_security');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('accommodation_units')
      .select(`
        id,
        unit_number,
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
        property:accommodation_properties (
          id,
          name,
          area,
          street,
          landmark
        )
      `, { count: 'exact' })
      .eq('availability_status', 'available')
      .order('last_verified_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filters
    if (room_type) query = query.eq('room_type', room_type);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (has_water === 'true') query = query.eq('has_water', true);
    if (has_electricity === 'true') query = query.eq('has_electricity', true);
    if (has_security === 'true') query = query.eq('has_security', true);

    const { data: units, error, count } = await query;

    if (error) throw error;

    // Filter by area or property name (search)
    let filtered = units || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((u: any) =>
        u.property?.name?.toLowerCase().includes(s) ||
        u.property?.area?.toLowerCase().includes(s) ||
        u.property?.street?.toLowerCase().includes(s) ||
        u.property?.landmark?.toLowerCase().includes(s)
      );
    }

    if (area) {
      filtered = filtered.filter((u: any) =>
        u.property?.area?.toLowerCase().includes(area.toLowerCase())
      );
    }

    // Attach cover media for each unit
    const unitIds = filtered.map((u: any) => u.id);
    let mediaByUnitId: Record<string, any> = {};

    if (unitIds.length > 0) {
      const { data: media } = await supabase
        .from('accommodation_media')
        .select('unit_id, file_path, file_name')
        .in('unit_id', unitIds)
        .eq('media_source', 'verified')
        .eq('is_cover', true);

      (media || []).forEach((m: any) => {
        mediaByUnitId[m.unit_id] = m;
      });
    }

    const result = filtered.map((u: any) => ({
      ...u,
      cover_image: mediaByUnitId[u.id] || null,
    }));

    return NextResponse.json({
      listings: result,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}