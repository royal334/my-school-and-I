// app/api/auth/vendor-signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    const body = await request.json();
    const {
      business_name,
      business_phone,
      business_address,
      full_name,
      email,
      password,
    } = body;

    // Validation
    if (!business_name || business_name.length < 3) {
      return NextResponse.json(
        { error: 'Business name must be at least 3 characters' },
        { status: 400 }
      );
    }

    const phoneRegex = /^(\+234|0)[789]\d{9}$/;
    if (!phoneRegex.test(business_phone)) {
      return NextResponse.json(
        { error: 'Invalid Nigerian phone number' },
        { status: 400 }
      );
    }

    if (!business_address || business_address.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a complete business address' },
        { status: 400 }
      );
    }

    if (!full_name || full_name.length < 3) {
      return NextResponse.json(
        { error: 'Full name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          account_type: 'vendor',
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Update profile with business info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        account_type: 'vendor',
        business_name,
        business_phone,
        business_address,
        business_verified: false,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail - user is created, they can update profile later
    }

    // Create vendor record
    const { error: vendorError } = await supabase.from('vendors').insert({
      owner_id: authData.user.id,
      business_name,
      phone_number: business_phone,
      location: business_address,
      description: `New vendor account for ${business_name}. Please update your business description.`,
      services: [],
      is_approved: false, // Pending admin approval
      subscription_tier: 'basic',
    });

    if (vendorError) {
      console.error('Vendor creation error:', vendorError);
      // Don't fail - user is created, they can create vendor profile later
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: authData.user.id,
      action: 'vendor_signup',
      details: { business_name, email },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Vendor signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
