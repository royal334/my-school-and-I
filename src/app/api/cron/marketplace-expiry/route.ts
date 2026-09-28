import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(await cookies());

    // 1. Expire overdue listings
    const { data: expired, error } = await supabase
      .rpc('expire_marketplace_listings');

    if (error) throw error;

    // 2. Deactivate expired boosts
    const { data: expiredBoosts } = await supabase
      .from('marketplace_boosts')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString())
      .select('listing_id');

    // 3. Remove boosted flag from listings with no active boosts
    if (expiredBoosts && expiredBoosts.length > 0) {
      const listingIds = expiredBoosts.map((b: any) => b.listing_id);

      for (const listingId of listingIds) {
        const { data: activeBoost } = await supabase
          .from('marketplace_boosts')
          .select('id')
          .eq('listing_id', listingId)
          .eq('is_active', true)
          .single();

        if (!activeBoost) {
          await supabase
            .from('marketplace_listings')
            .update({ is_boosted: false })
            .eq('id', listingId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      expired_listings: expired,
      expired_boosts: expiredBoosts?.length || 0,
    });
  } catch (error: any) {
    console.error('Marketplace expiry cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}