// app/api/vendors/reviews/create/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendor_id, rating, comment } = await request.json();

    // Validate
    if (!vendor_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Check if user already reviewed this vendor
    const { data: existing } = await supabase
      .from('vendor_reviews')
      .select('id')
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this vendor' },
        { status: 400 }
      );
    }

    // Insert review
    const { data: review, error } = await supabase
      .from('vendor_reviews')
      .insert({
        vendor_id,
        user_id: user.id,
        rating,
        comment,
        is_approved: true, 
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}