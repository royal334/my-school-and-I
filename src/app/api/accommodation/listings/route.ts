// app/api/accommodation/listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withAccommodationMediaUrls } from '@/utils/lib/accommodation-media';

const SERVICE_FEE_MULTIPLIER = 1.2;

interface AccommodationPropertyRow {
  id: string;
  name: string | null;
  area: string | null;
  street: string | null;
  landmark: string | null;
}

interface AccommodationUnitRow {
  id: string;
  room_type: string;
  price: number | string;
  property: AccommodationPropertyRow | AccommodationPropertyRow[] | null;
  [key: string]: unknown;
}

interface AccommodationMediaRow {
  unit_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  is_cover: boolean;
  display_order: number;
}

function getProperty(unit: AccommodationUnitRow): AccommodationPropertyRow | null {
  return Array.isArray(unit.property) ? unit.property[0] || null : unit.property;
}

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
    if (min_price) query = query.gte('price', (parseFloat(min_price) - 0.5) / SERVICE_FEE_MULTIPLIER);
    if (max_price) query = query.lte('price', (parseFloat(max_price) + 0.5) / SERVICE_FEE_MULTIPLIER);
    if (has_water === 'true') query = query.eq('has_water', true);
    if (has_electricity === 'true') query = query.eq('has_electricity', true);
    if (has_security === 'true') query = query.eq('has_security', true);

    const { data: units, error, count } = await query;

    if (error) throw error;

    // Filter by area or property name (search)
    let filtered: AccommodationUnitRow[] = (units || []) as AccommodationUnitRow[];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((u) => {
        const property = getProperty(u);
        return property?.name?.toLowerCase().includes(s) ||
          property?.area?.toLowerCase().includes(s) ||
          property?.street?.toLowerCase().includes(s) ||
          property?.landmark?.toLowerCase().includes(s);
      });
    }

    if (area) {
      filtered = filtered.filter((u) =>
        getProperty(u)?.area?.toLowerCase().includes(area.toLowerCase())
      );
    }

    // Attach cover media for each unit
    const unitIds = filtered.map((u) => u.id);
    const mediaByUnitId: Record<string, AccommodationMediaRow & { url: string | null }> = {};

    if (unitIds.length > 0) {
      const { data: media } = await supabase
        .from('accommodation_media')
        .select('unit_id, file_path, file_name, file_type, is_cover')
        .in('unit_id', unitIds)
        .eq('media_source', 'verified')
        .order('is_cover', { ascending: false })
        .order('display_order', { ascending: true });

      const mediaWithUrls = await withAccommodationMediaUrls(
        supabase,
        (media || []) as AccommodationMediaRow[],
      );
      mediaWithUrls.forEach((m) => {
        if (!mediaByUnitId[m.unit_id]) {
          mediaByUnitId[m.unit_id] = m;
        }
      });
    }

    const result = filtered.map((u) => {
      const property = getProperty(u);
      return {
        ...u,
        price: Math.round(Number(u.price) * SERVICE_FEE_MULTIPLIER),
        property: property
          ? { id: property.id, area: property.area, landmark: property.landmark }
          : null,
        cover_image: mediaByUnitId[u.id] || null,
      };
    });

    return NextResponse.json({
      listings: result,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}