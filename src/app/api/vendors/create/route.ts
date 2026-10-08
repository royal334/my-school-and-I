// app/api/vendors/create/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getVendorServiceOptions } from '@/components/vendors/category-types';

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

    if (!category_id || !Array.isArray(services) || services.some((service) => typeof service !== 'string')) {
      return NextResponse.json(
        { error: 'Select a category and valid services.' },
        { status: 400 },
      );
    }

    const { data: category, error: categoryError } = await supabase
      .from('vendor_categories')
      .select('id, services')
      .eq('id', category_id)
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) {
      return NextResponse.json({ error: 'Select a valid category.' }, { status: 400 });
    }

    const categoryServices = getVendorServiceOptions(category.services).map(({ value }) => value);
    if (services.some((service: string) => !categoryServices.includes(service))) {
      return NextResponse.json(
        { error: 'Choose services from the selected category.' },
        { status: 400 },
      );
    }

    // Sync business fields onto the user's profile
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        account_type:'student_vendor',
        business_name,
        business_phone: phone_number,
        business_address: location ?? null,
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