// app/api/auth/vendor-signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { passwordStrengthSchema } from '@/lib/validations/password';
import { getVendorServiceOptions } from '@/components/vendors/category-types';
import { z } from 'zod';

const phoneNumberSchema = z
  .string()
  .regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number');

const vendorSignupSchema = z
  .object({
    business_name: z.string().trim().min(3).max(200),
    category_id: z.string().min(1),
    description: z.string().trim().min(20).max(2000),
    services: z.array(z.string()).min(1).max(5),
    phone_number: phoneNumberSchema,
    whatsapp_number: z
      .string()
      .default('')
      .refine(
        (value) => value === '' || /^(\+234|0)[789]\d{9}$/.test(value),
        'Invalid Nigerian phone number',
      ),
    location: z.string().trim().max(500).default(''),
    operating_hours: z.string().trim().max(200).default(''),
    full_name: z.string().trim().min(3).max(100),
    email: z.string().email(),
    password: passwordStrengthSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    // Service-role client. The anon key cannot insert into profiles here
    // because a freshly signed-up user has no session yet, so RLS rejects it.
    const admin = createAdminClient();

    const parsedBody = vendorSignupSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || 'Invalid vendor registration details.' },
        { status: 400 },
      );
    }

    const {
      business_name,
      category_id,
      description,
      services,
      phone_number,
      whatsapp_number,
      location,
      operating_hours,
      full_name,
      email,
      password,
    } = parsedBody.data;

    const { data: category, error: categoryError } = await admin
      .from('vendor_categories')
      .select('id, services')
      .eq('id', category_id)
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) {
      return NextResponse.json({ error: 'Select a valid category.' }, { status: 400 });
    }

    const categoryServices = getVendorServiceOptions(category.services).map(({ value }) => value);
    if (
      services.some((service: unknown) =>
        typeof service !== 'string' || !categoryServices.includes(service)
      )
    ) {
      return NextResponse.json(
        { error: 'Choose services from the selected category.' },
        { status: 400 },
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
        business_phone: phone_number,
        business_address: location || null,
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
      phone_number,
      whatsapp_number: whatsapp_number || null,
      location: location || null,
      operating_hours: operating_hours || null,
      description,
      services,
      is_approved: true, // Pending admin approval
      subscription_tier: 'basic',
    });

    if (vendorError) {
      console.error('Vendor creation error:', vendorError);
      const { error: rollbackError } = await admin.auth.admin.deleteUser(authData.user.id);
      if (rollbackError) {
        console.error('Failed to roll back vendor signup:', rollbackError);
      }
      return NextResponse.json(
        {
          error: 'Could not save your vendor listing. Please try again.',
        },
        { status: 500 },
      );
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
