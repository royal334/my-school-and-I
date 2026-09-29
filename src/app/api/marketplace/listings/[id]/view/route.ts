// app/api/marketplace/listings/[id]/view/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/marketplace/listings/[id]/view
// Records a single view of a listing. Called by ListingViewTracker on mount,
// which keeps the write off the server-render path — a Link prefetch renders
// the page but never mounts the client component, so it cannot inflate the
// counter. See supabase/migrations/increment_marketplace_views.sql.
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

    // Sellers do not inflate their own listing's counter.
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .maybeSingle();

    if (listingError) throw listingError;

    if (!listing || listing.seller_id === user.id) {
      return NextResponse.json({ success: true, counted: false });
    }

    const { error } = await supabase.rpc('increment_marketplace_views', {
      p_listing_id: id,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, counted: true });
  } catch (error: unknown) {
    // A dropped view should never surface to the user, so this stays quiet.
    console.error('Record listing view error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
