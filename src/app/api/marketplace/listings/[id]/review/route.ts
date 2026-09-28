// app/api/marketplace/listings/[id]/review/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/marketplace/listings/[id]/review
export async function POST(
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

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Get listing to check ownership and get seller/vendor info
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('seller_id, vendor_id')
      .eq('id', id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Can't review your own listing
    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot review your own listing' },
        { status: 400 }
      );
    }

    const { data: review, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        listing_id: id,
        reviewer_id: user.id,
        seller_id: listing.seller_id,
        vendor_id: listing.vendor_id || null,
        rating,
        comment: comment || null,
      })
      .select(`
        id, rating, comment, created_at,
        reviewer:profiles!marketplace_reviews_reviewer_id_fkey (
          id, full_name
        )
      `)
      .single();

    if (error) {
      // Duplicate review
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reviewed this listing' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}