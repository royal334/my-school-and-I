// app/api/vendors/[id]/analytics/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{id: string }> }
) {
  try {
    const supabase = createClient(await cookies());

    const { id } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vendor and check ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('owner_id, subscription_tier')
      .eq('id', id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (vendor.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Determine granularity based on subscription tier
    let granularity: 'hour' | 'day' | 'month';
    if (vendor.subscription_tier === 'featured') {
      granularity = 'hour';
    } else if (vendor.subscription_tier === 'premium') {
      granularity = 'day';
    } else {
      granularity = 'month';
    }

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('vendor_analytics')
      .select('*')
      .eq('vendor_id', id)
      .eq('granularity', granularity)
      .gte('period_start', startDate.toISOString())
      .lte('period_end', endDate.toISOString())
      .order('period_start', { ascending: true });

    if (analyticsError) {
      console.error('Analytics fetch error:', analyticsError);
      // Return empty data if no analytics yet
      return NextResponse.json({
        analytics: [],
        summary: {
          views: 0,
          phone_contacts: 0,
          whatsapp_contacts: 0,
          total_contacts: 0,
          conversionRate: 0,
        },
        sources: {},
        granularity,
      });
    }

    // Calculate totals
    const totals = (analytics || []).reduce(
      (acc, curr) => ({
        views: acc.views + (curr.views || 0),
        phone_contacts: acc.phone_contacts + (curr.phone_contacts || 0),
        whatsapp_contacts: acc.whatsapp_contacts + (curr.whatsapp_contacts || 0),
        total_contacts: acc.total_contacts + (curr.total_contacts || 0),
      }),
      { views: 0, phone_contacts: 0, whatsapp_contacts: 0, total_contacts: 0 }
    );

    // Calculate conversion rate
    const conversionRate =
      totals.views > 0
        ? parseFloat(((totals.total_contacts / totals.views) * 100).toFixed(2))
        : 0;

    // Aggregate sources (Featured tier only)
    let sources: Record<string, number> = {};
    if (vendor.subscription_tier === 'featured' && analytics) {
      sources = analytics.reduce((acc, curr) => {
        const currSources = (curr.sources as Record<string, number>) || {};
        Object.keys(currSources).forEach((key) => {
          acc[key] = (acc[key] || 0) + currSources[key];
        });
        return acc;
      }, {} as Record<string, number>);
    }

    return NextResponse.json({
      analytics: analytics || [],
      summary: {
        ...totals,
        conversionRate,
      },
      sources,
      granularity,
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}