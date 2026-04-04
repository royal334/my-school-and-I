// app/api/vendors/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Fetch single vendor
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(await cookies());

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(
        `
        *,
        vendor_categories (
          name,
          icon
        ),
        profiles (
          full_name
        )
      `
      )
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update vendor
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check ownership
    const { data: vendor } = await supabase
      .from('vendors')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (!vendor || vendor.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get update data
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
    } = body;

    // Validation
    if (business_name && business_name.length < 3) {
      return NextResponse.json(
        { error: 'Business name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (description && description.length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (services && (!Array.isArray(services) || services.length === 0)) {
      return NextResponse.json(
        { error: 'At least one service must be selected' },
        { status: 400 }
      );
    }

    if (services && services.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 services allowed' },
        { status: 400 }
      );
    }

    if (phone_number) {
      const phoneRegex = /^(\+234|0)[789]\d{9}$/;
      if (!phoneRegex.test(phone_number)) {
        return NextResponse.json(
          { error: 'Invalid Nigerian phone number' },
          { status: 400 }
        );
      }
    }

    if (whatsapp_number) {
      const phoneRegex = /^(\+234|0)[789]\d{9}$/;
      if (!phoneRegex.test(whatsapp_number)) {
        return NextResponse.json(
          { error: 'Invalid WhatsApp number' },
          { status: 400 }
        );
      }
    }

    // Update vendor
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors')
      .update({
        business_name,
        category_id,
        description,
        services,
        phone_number,
        whatsapp_number: whatsapp_number || null,
        location: location || null,
        operating_hours: operating_hours || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vendor' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'update_vendor',
      details: { vendor_id: params.id },
    });

    return NextResponse.json({ vendor: updatedVendor });
  } catch (error: any) {
    console.error('Vendor update error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete vendor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check ownership
    const { data: vendor } = await supabase
      .from('vendors')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (!vendor || vendor.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete vendor
    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete vendor' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'delete_vendor',
      details: { vendor_id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Vendor deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
