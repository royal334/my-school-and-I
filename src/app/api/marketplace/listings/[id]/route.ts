// app/api/marketplace/listings/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/marketplace/listings/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        images:marketplace_listing_images (
          id, file_path, file_name, is_cover, display_order
        )
      `)
      .eq('id', id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Only allow viewing active listings (or own listings)
    if (listing.status !== 'active' && listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Get seller name + phone
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', listing.seller_id)
      .single();

    const { data: marketplaceSellerProfile } = await supabase
      .from('marketplace_seller_profiles')
      .select('user_id, seller_type, average_rating, review_count, total_sales')
      .eq('user_id', listing.seller_id)
      .maybeSingle();

    // Get reviews for this listing
    const { data: reviews } = await supabase
      .from('marketplace_reviews')
      .select(`
        id, rating, comment, created_at,
        reviewer:profiles!marketplace_reviews_reviewer_id_fkey (
          id, full_name
        )
      `)
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Check if user saved this listing
    const { data: save } = await supabase
      .from('marketplace_saves')
      .select('id')
      .eq('listing_id', id)
      .eq('user_id', user.id)
      .single();

    // Check if user already reviewed
    const { data: userReview } = await supabase
      .from('marketplace_reviews')
      .select('id, rating, comment')
      .eq('listing_id', id)
      .eq('reviewer_id', user.id)
      .single();

    // View counting is not done here. It lives in POST /view, which the
    // ListingViewTracker client component calls on mount.

    // Get active boost info
    const { data: activeBoost } = await supabase
      .from('marketplace_boosts')
      .select('boost_tier, expires_at')
      .eq('listing_id', id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    // Get vendor info if vendor listing
    let vendorInfo = null;
    if (listing.vendor_id) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id, business_name, rating')
        .eq('id', listing.vendor_id)
        .single();
      vendorInfo = vendor;
    }

    return NextResponse.json({
      listing: {
        ...listing,
        seller_name: sellerProfile?.full_name || 'Unknown',
        seller_profile: marketplaceSellerProfile || null,
        is_saved: !!save,
        is_own: listing.seller_id === user.id,
        active_boost: activeBoost || null,
        vendor: vendorInfo,
      },
      reviews: reviews || [],
      user_review: userReview || null,
    });
  } catch (error: any) {
    console.error('Fetch listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/marketplace/listings/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, description, price, negotiable,
      condition, location, is_urgent, status,
    } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (negotiable !== undefined) updates.negotiable = negotiable;
    if (condition !== undefined) updates.condition = condition;
    if (location !== undefined) updates.location = location;
    if (is_urgent !== undefined) updates.is_urgent = is_urgent;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'sold') updates.sold_at = new Date().toISOString();
    }

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/listings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'admin'])
      .single();

    // Archive instead of hard delete (preserves reviews etc.)
    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.seller_id !== user.id && !isAdmin.data) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await supabase
      .from('marketplace_listings')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true, message: 'Listing archived' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete listing' },
      { status: 500 }
    );
  }
}