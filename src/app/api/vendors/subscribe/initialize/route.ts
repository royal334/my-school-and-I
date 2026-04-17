// app/api/vendors/subscribe/initialize/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { 
  initializePaystackTransaction, 
  generatePaymentReference, 
  toKobo 
} from '@/utils/lib/paystack';

const TIER_PRICING = {
  basic: 0,
  premium: 2000, // ₦2,000
  featured: 5000, // ₦5,000
};

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vendor_id, tier } = body;

    // Validate tier
    if (!['premium', 'featured'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get vendor and check ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('owner_id, business_name')
      .eq('id', vendor_id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (vendor.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const amountNaira = TIER_PRICING[tier as keyof typeof TIER_PRICING];
    const amount = toKobo(amountNaira);
    const reference = generatePaymentReference(user.id);

    // Initialize Paystack transaction using helper
    const paystackData = await initializePaystackTransaction({
      email: profile?.email || user.email!,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/vendors/subscribe/verify?reference=${reference}`,
      metadata: {
        vendor_id,
        tier,
        user_id: user.id,
        full_name: profile?.full_name || 'Vendor',
        business_name: vendor.business_name,
        subscription_type: 'vendor_subscription',
      },
    });

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      throw new Error(paystackData.message || 'Payment initialization failed');
    }

    // Store payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: user.id,
      reference,
      amount: amountNaira,
      currency: 'NGN',
      type: 'vendor_subscription',
      status: 'pending',
      metadata: {
        vendor_id,
        tier,
      },
    });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'subscription_initialize',
      details: {
        vendor_id,
        tier,
        reference,
        amount: amountNaira,
      },
    });

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference,
    });
  } catch (error: any) {
    console.error('Subscription initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}