// app/api/marketplace/my-listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/marketplace/my-listings
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('marketplace_listings')
      .select(`
        id, title, price, condition, category, status,
        is_boosted, is_urgent, views, saves_count,
        created_at, sold_at, expires_at,
        images:marketplace_listing_images (
          file_path, is_cover, display_order
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: listings, error } = await query;
    if (error) throw error;

    // Attach cover image
    const result = (listings || []).map(l => ({
      ...l,
      cover_image: (l.images || []).find((i: any) => i.is_cover)
        || (l.images || [])[0]
        || null,
    }));

    return NextResponse.json({ listings: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}