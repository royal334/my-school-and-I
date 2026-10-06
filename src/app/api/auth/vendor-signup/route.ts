// app/api/auth/vendor-signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { passwordStrengthSchema } from '@/lib/validations/password';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    // Service-role client. The anon key cannot insert into profiles here
    // because a freshly signed-up user has no session yet, so RLS rejects it.
    const admin = createAdminClient();

    const body = await request.json();
    const {
      business_name,
      category_id,
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

    if (!category_id) {
      return NextResponse.json(
        { error: 'Please select a category' },
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

    const passwordResult = passwordStrengthSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.issues[0]?.message || 'Enter a valid password.' },
        { status: 400 }
      );
    }

    // Check if email already exists. Queried with the admin client: an RLS
    // 'select id' on another user's row is not visible to the anon key.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
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
      if (/already (registered|exists)/i.test(authError.message)) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

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

    // Upsert (not update): a previous run may have created the auth user without
    // a profiles row, in which case .update() silently matches zero rows.
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: authData.user.id,
        email,
        full_name,
        account_type: 'vendor',
        business_name,
        business_phone,
        business_address,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      // Never swallow this: roll the auth user back so signup can be retried.
      console.error('Profile insert error:', profileError);
      await admin.auth.admin.deleteUser(authData.user.id).catch((e) => {
        console.error('Failed to roll back auth user:', e);
      });

      return NextResponse.json(
        { error: 'Failed to create profile. Please try again.' },
        { status: 500 }
      );
    }

    // Create vendor record
    const { error: vendorError } = await admin.from('vendors').insert({
      owner_id: authData.user.id,
      business_name,
      category_id,
      phone_number: business_phone,
      location: business_address,
      description: '',
      services: [],
      is_approved: true, // Pending admin approval
      subscription_tier: 'basic',
      vendor_type: 'vendor',
    });

    if (vendorError) {
      console.error('Vendor creation error:', vendorError);
      // Don't fail - user is created, they can create vendor profile later
    }

    // Log activity
    await admin.from('activity_logs').insert({
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
  } catch (error: unknown) {
    console.error('Vendor signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
