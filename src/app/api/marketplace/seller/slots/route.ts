// app/api/marketplace/seller/slots/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/marketplace/seller/slots
export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: slotData } = await supabase
      .from('marketplace_slot_usage')
      .select('user_id, account_type, active_listings, max_listings, available_slots')
      .eq('user_id', user.id)
      .single();

    // Default for new users with no listings yet
    const slots = slotData || {
      user_id: user.id,
      active_listings: 0,
      max_listings: 3,
      available_slots: 3,
    };

    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}