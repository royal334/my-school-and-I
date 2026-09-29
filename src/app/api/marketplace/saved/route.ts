// app/api/marketplace/saved/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/marketplace/saved
export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: saves, error } = await supabase
      .from('marketplace_saves')
      .select(`
        listing:marketplace_listings (
          id, title, price, negotiable, condition, category, status,
          seller_type, seller_id, is_urgent, location, created_at,
          images:marketplace_listing_images (
            file_path, is_cover, display_order
          )
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) throw error;

    // Get seller names
    const listings = (saves || [])
      .map((s: any) => s.listing)
      .filter(Boolean);

    const sellerIds = [...new Set(listings.map((l: any) => l.seller_id))];
    let profilesById: Record<string, any> = {};

    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds);
      (profiles || []).forEach(p => { profilesById[p.id] = p; });
    }

    const result = listings.map((l: any) => ({
      ...l,
      seller_name: profilesById[l.seller_id]?.full_name || 'Unknown',
      cover_image: (l.images || []).find((i: any) => i.is_cover)
        || (l.images || [])[0]
        || null,
    }));

    return NextResponse.json({ listings: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}