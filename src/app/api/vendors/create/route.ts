// app/api/vendors/create/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const body = await request.json();
    const {
      business_name,
      category_id,
      description,
      services,
      phone_number,
      whatsapp_number,
      location,
      operating_hours,
      logo_url,
      cover_image_url,
      gallery_images,
    } = body;

    // Server-side validation
    if (!business_name || business_name.length < 3) {
      return NextResponse.json(
        { error: 'Business name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service must be selected' },
        { status: 400 }
      );
    }

    // Sync business fields onto the user's profile
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        business_name,
        business_phone: phone_number,
        business_address: location ?? null,
        business_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Profile update error:", profileUpdateError);
      return NextResponse.json(
        { error: "Failed to update profile business details" },
        { status: 500 },
      );
    }

    // Insert vendor
    const { data: vendor, error: insertError } = await supabase
      .from('vendors')
      .insert({
        owner_id: user.id,
        business_name,
        category_id,
        description,
        services,
        phone_number,
        whatsapp_number,
        location,
        operating_hours,
        logo_url: logo_url || null,
        cover_image_url: cover_image_url || null,
        gallery_images: gallery_images || [],
        is_approved: true, // Pending admin approval
        subscription_tier: 'basic',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      );
    }

    // TODO: Send notification to admin
    // await notifyAdmin('new_vendor', vendor.id);

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: any) {
    console.error('Vendor creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}