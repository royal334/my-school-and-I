// app/api/marketplace/listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { shuffle } from '@/utils/lib';

const CATEGORIES = [
  'electronics', 'books', 'fashion', 'furniture',
  'gaming', 'hostel_items', 'beauty', 'kitchen', 'other'
];

// GET /api/marketplace/listings
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const seller_type = searchParams.get('seller_type') || '';
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const urgent = searchParams.get('urgent') === 'true';
    const negotiable = searchParams.get('negotiable') === 'true';
    const sort = searchParams.get('sort') || 'recent'; // 'recent', 'price_asc', 'price_desc'
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch boosted listings first (separate query)
    const { data: boostedListings } = await supabase
      .from('marketplace_listings')
      .select(`
        id, title, price, negotiable, condition, category,
        seller_type, seller_id, vendor_id, is_urgent, is_boosted,
        location, views, saves_count, created_at,
        images:marketplace_listing_images (
          file_path, is_cover, display_order
        )
      `)
      .eq('status', 'active')
      .eq('is_boosted', true)
      .order('created_at', { ascending: false })
      .limit(6);

    // Main feed query
    let query = supabase
      .from('marketplace_listings')
      .select(`
        id, title, price, negotiable, condition, category,
        seller_type, seller_id, vendor_id, is_urgent, is_boosted,
        location, views, saves_count, created_at,
        images:marketplace_listing_images (
          file_path, is_cover, display_order
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .eq('is_boosted', false) // Non-boosted for main feed
      .range(offset, offset + limit - 1);

    // Filters
    if (category) query = query.eq('category', category);
    if (condition) query = query.eq('condition', condition);
    if (seller_type) query = query.eq('seller_type', seller_type);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (urgent) query = query.eq('is_urgent', true);
    if (negotiable) query = query.eq('negotiable', true);

    // Sort
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data: listings, error, count } = await query;
    if (error) throw error;

    // Search filter (client-side for now — add FTS later)
    let filtered = listings || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(s) ||
        l.category.toLowerCase().includes(s)
      );
    }

    // Get seller names for all listings
    const allListings = [...(boostedListings || []), ...filtered];
    const sellerIds = [...new Set(allListings.map(l => l.seller_id))];

    let profilesById: Record<string, any> = {};
    let sellerProfilesByUserId: Record<string, any> = {};
    if (sellerIds.length > 0) {
      const [{ data: profiles }, { data: sellerProfiles }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', sellerIds),
        supabase
          .from('marketplace_seller_profiles')
          .select('user_id, seller_type, average_rating, review_count')
          .in('user_id', sellerIds),
      ]);
      (profiles || []).forEach(p => { profilesById[p.id] = p; });
      (sellerProfiles || []).forEach(p => { sellerProfilesByUserId[p.user_id] = p; });
    }

    // Get user's saves for these listings
    const allIds = allListings.map(l => l.id);
    let savedIds = new Set<string>();
    if (allIds.length > 0) {
      const { data: saves } = await supabase
        .from('marketplace_saves')
        .select('listing_id')
        .eq('user_id', user.id)
        .in('listing_id', allIds);
      savedIds = new Set((saves || []).map(s => s.listing_id));
    }

    const enrich = (l: any) => ({
      ...l,
      cover_image: (l.images || []).find((i: any) => i.is_cover)
        || (l.images || [])[0]
        || null,
      seller_name: profilesById[l.seller_id]?.full_name || 'Unknown',
      seller_profile: sellerProfilesByUserId[l.seller_id] || null,
      is_saved: savedIds.has(l.id),
    });

    return NextResponse.json({
      promoted: shuffle((boostedListings || []).map(enrich)),
      listings: filtered.map(enrich),
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

// POST /api/marketplace/listings
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, category, subcategory,
      price, negotiable, condition, location, is_urgent,
    } = body;

    // Validate required fields
    if (!title || !category || !price || !condition) {
      return NextResponse.json(
        { error: 'title, category, price and condition are required' },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Check slot availability
    const { data: slotData } = await supabase
      .from('marketplace_slot_usage')
      .select('available_slots, max_listings, active_listings')
      .eq('user_id', user.id)
      .single();

    // If no seller profile row exists yet, they have full slots
    const availableSlots = slotData?.available_slots ?? 3;
    const maxListings = slotData?.max_listings ?? 3;

    if (availableSlots <= 0) {
      return NextResponse.json(
        {
          error: 'listing_limit_reached',
          message: `You have reached your limit of ${maxListings} active listings.`,
          max_listings: maxListings,
        },
        { status: 403 }
      );
    }

    // Get vendor_id if user is a vendor
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single();

    let vendor_id = null;
    if (profile?.account_type === 'vendor') {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      vendor_id = vendor?.id || null;
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id: user.id,
        title,
        description: description || null,
        category,
        subcategory: subcategory || null,
        price: parseFloat(price),
        negotiable: negotiable ?? false,
        condition,
        location: location || null,
        is_urgent: is_urgent ?? false,
        seller_type: profile?.account_type === 'vendor' ? 'vendor' : 'student',
        vendor_id,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Ensure seller profile exists
    await supabase
      .from('marketplace_seller_profiles')
      .upsert({
        user_id: user.id,
        seller_type: profile?.account_type === 'vendor' ? 'vendor' : 'student',
      }, { onConflict: 'user_id' });

    return NextResponse.json({
      success: true,
      listing,
      message: 'Listing created successfully',
    });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}