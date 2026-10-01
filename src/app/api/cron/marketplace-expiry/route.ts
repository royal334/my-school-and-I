import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: expiredListings, error: listingExpiryError } = await supabase
      .rpc('expire_marketplace_listings');

    if (listingExpiryError) throw listingExpiryError;

    const { data: expiredBoosts, error: boostExpiryError } = await supabase
      .from('marketplace_boosts')
      .update({ is_active: false })
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.lte.${now}`)
      .select('listing_id');

    if (boostExpiryError) throw boostExpiryError;

    const { data: boostedListings, error: boostedListingsError } = await supabase
      .from('marketplace_listings')
      .select('id')
      .eq('is_boosted', true);

    if (boostedListingsError) throw boostedListingsError;

    const boostedListingIds = (boostedListings || []).map((listing) => listing.id);
    let staleListingIds: string[] = [];

    if (boostedListingIds.length > 0) {
      const { data: activeBoosts, error: activeBoostsError } = await supabase
        .from('marketplace_boosts')
        .select('listing_id')
        .in('listing_id', boostedListingIds)
        .eq('is_active', true)
        .gt('expires_at', now);

      if (activeBoostsError) throw activeBoostsError;

      const listingsWithActiveBoosts = new Set(
        (activeBoosts || []).map((boost) => boost.listing_id),
      );
      staleListingIds = boostedListingIds.filter(
        (listingId) => !listingsWithActiveBoosts.has(listingId),
      );
    }

    if (staleListingIds.length > 0) {
      const { error: clearFlagsError } = await supabase
        .from('marketplace_listings')
        .update({ is_boosted: false })
        .in('id', staleListingIds);

      if (clearFlagsError) throw clearFlagsError;
    }

    return NextResponse.json({
      success: true,
      expired_listings: expiredListings,
      expired_boosts: expiredBoosts?.length || 0,
      cleared_boost_flags: staleListingIds.length,
    });
  } catch (error) {
    console.error('Marketplace expiry cron error:', error);
    const message = error instanceof Error ? error.message : 'Marketplace expiry failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}