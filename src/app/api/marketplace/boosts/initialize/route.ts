// app/api/marketplace/boosts/initialize/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  generatePaymentReference,
  initializePaystackTransaction,
  toKobo,
} from '@/utils/lib/paystack';

const BOOST_PRICES: Record<string, { price: number; hours: number }> = {
  standard: { price: 500,  hours: 24  },
  premium:  { price: 1500, hours: 72  },
  featured: { price: 3000, hours: 168 },
};

export function handlePrice(price: number) {
  if (price < 2500) {
    return price + 0.015 * price;
  }
  return price + (0.015 * price + 100);
}

// POST /api/marketplace/boosts/initialize
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id, boost_tier } = await request.json();

    if (!listing_id || !boost_tier || !BOOST_PRICES[boost_tier]) {
      return NextResponse.json({ error: 'Invalid listing_id or boost_tier' }, { status: 400 });
    }

    // Verify listing ownership
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('seller_id, title, status')
      .eq('id', listing_id)
      .single();

    if (!listing || listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found or not authorized' }, { status: 403 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Only active listings can be boosted' }, { status: 400 });
    }

    const tierInfo = BOOST_PRICES[boost_tier];
    const reference = generatePaymentReference(user.id);

    // Get the user's profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const email = user.email || profile?.email;
    if (!email) {
      return NextResponse.json({ error: 'Account email not found' }, { status: 400 });
    }

    // Create pending boost record
    await supabase.from('marketplace_boosts').insert({
      listing_id,
      seller_id: user.id,
      boost_tier,
      price_paid: tierInfo.price,
      duration_hours: tierInfo.hours,
      paystack_reference: reference,
      payment_status: 'pending',
      is_active: false,
    });

    const paystackData = await initializePaystackTransaction({
      email,
      amount: toKobo(handlePrice(tierInfo.price)), // Convert to kobo
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/boosts/verify?reference=${reference}`,
      metadata: {
        user_id: user.id,
        full_name: profile?.full_name || 'Marketplace seller',
        subscription_type: 'marketplace_boost',
        listing_id,
        boost_tier,
        seller_id: user.id,
        listing_title: listing.title,
      },
    });

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Paystack initialization failed');
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error('Boost initialize error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}