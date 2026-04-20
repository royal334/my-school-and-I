// app/api/vendors/[id]/analytics/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getVendorFeatures } from '@/utils/lib/vendor-features';

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
      .select('owner_id, subscription_tier, subscription_expires_at')
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
    startDate.setDate(startDate.getDate() - (days * 2)); // Fetch double for comparison

    const midDate = new Date();
    midDate.setDate(midDate.getDate() - days);

    // Get features including granularity
    const features = getVendorFeatures(vendor);
    const preferredGranularity = features.analyticsGranularity;

    // Fetch analytics data
    let { data: analytics, error: analyticsError } = await supabase
      .from('vendor_analytics')
      .select('*')
      .eq('vendor_id', id)
      .gte('period_start', startDate.toISOString())
      .lte('period_end', endDate.toISOString())
      .order('period_start', { ascending: true });

    if (analyticsError) {
      console.error('Analytics fetch error:', analyticsError);
      return NextResponse.json({
        analytics: [],
        summary: { views: 0, phone_contacts: 0, whatsapp_contacts: 0, total_contacts: 0, conversionRate: 0 },
        previousSummary: { views: 0, phone_contacts: 0, whatsapp_contacts: 0, total_contacts: 0, conversionRate: 0 },
        sources: {},
        granularity: preferredGranularity,
      });
    }

    // Split data into current and previous periods
    const currentPeriodData = analytics?.filter(a => new Date(a.period_start) >= midDate) || [];
    const previousPeriodData = analytics?.filter(a => new Date(a.period_start) < midDate) || [];

    // Helper to get date key based on granularity
    const getDateKey = (dateStr: string, gran: string) => {
      const d = new Date(dateStr);
      if (gran === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      if (gran === 'day') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return d.toISOString();
    };

    // Filter by preferred granularity or aggregate for the CURRENT period
    const hasPreferred = currentPeriodData.some(a => a.granularity === preferredGranularity);
    let processedAnalytics: any[] = [];
    let activeGranularity = preferredGranularity;

    if (hasPreferred) {
      processedAnalytics = currentPeriodData.filter(a => a.granularity === preferredGranularity);
    } else if (currentPeriodData.length > 0) {
      // Find what we have
      const sourceGranularity = currentPeriodData.some(a => a.granularity === 'hour') ? 'hour' : 
                               currentPeriodData.some(a => a.granularity === 'day') ? 'day' : 'month';
      
      const granOrder = { 'hour': 0, 'day': 1, 'month': 2 };
      
      // If we have finer data than preferred, AGGREGATE it
      if (granOrder[sourceGranularity as keyof typeof granOrder] < granOrder[preferredGranularity as keyof typeof granOrder]) {
        const groups: Record<string, any> = {};
        
        currentPeriodData.forEach(item => {
          const key = getDateKey(item.period_start, preferredGranularity);
          if (!groups[key]) {
            groups[key] = {
              period_start: key,
              views: 0,
              phone_contacts: 0,
              whatsapp_contacts: 0,
              total_contacts: 0,
              granularity: preferredGranularity,
              sources: {}
            };
          }
          
          groups[key].views += (item.views || 0);
          groups[key].phone_contacts += (item.phone_contacts || 0);
          groups[key].whatsapp_contacts += (item.whatsapp_contacts || 0);
          groups[key].total_contacts += (item.total_contacts || 0);
          
          if (item.sources) {
            Object.entries(item.sources as Record<string, number>).forEach(([src, val]) => {
              groups[key].sources[src] = (groups[key].sources[src] || 0) + val;
            });
          }
        });
        
        processedAnalytics = Object.values(groups).sort((a, b) => 
          new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
        );
      } else {
        // Fallback: use whatever is available if we can't aggregate
        processedAnalytics = currentPeriodData.filter(a => a.granularity === sourceGranularity);
        activeGranularity = sourceGranularity;
      }
    }

    // Calculate totals for current period
    const totals = currentPeriodData.reduce(
      (acc, curr) => ({
        views: acc.views + (curr.views || 0),
        phone_contacts: acc.phone_contacts + (curr.phone_contacts || 0),
        whatsapp_contacts: acc.whatsapp_contacts + (curr.whatsapp_contacts || 0),
        total_contacts: acc.total_contacts + (curr.total_contacts || 0),
      }),
      { views: 0, phone_contacts: 0, whatsapp_contacts: 0, total_contacts: 0 }
    );

    // Calculate totals for previous period
    const prevTotals = previousPeriodData.reduce(
      (acc, curr) => ({
        views: acc.views + (curr.views || 0),
        phone_contacts: acc.phone_contacts + (curr.phone_contacts || 0),
        whatsapp_contacts: acc.whatsapp_contacts + (curr.whatsapp_contacts || 0),
        total_contacts: acc.total_contacts + (curr.total_contacts || 0),
      }),
      { views: 0, phone_contacts: 0, whatsapp_contacts: 0, total_contacts: 0 }
    );

    const conversionRate = totals.views > 0 ? parseFloat(((totals.total_contacts / totals.views) * 100).toFixed(2)) : 0;
    const prevConversionRate = prevTotals.views > 0 ? parseFloat(((prevTotals.total_contacts / prevTotals.views) * 100).toFixed(2)) : 0;

    // Aggregate sources (Featured tier only) - only for current period
    let sources: Record<string, number> = {};
    if (features.isFeatured && currentPeriodData.length > 0) {
      sources = currentPeriodData.reduce((acc, curr) => {
        const currSources = (curr.sources as Record<string, number>) || {};
        Object.keys(currSources).forEach((key) => {
          acc[key] = (acc[key] || 0) + currSources[key];
        });
        return acc;
      }, {} as Record<string, number>);
    }

    return NextResponse.json({
      analytics: processedAnalytics,
      summary: { ...totals, conversionRate },
      previousSummary: { ...prevTotals, conversionRate: prevConversionRate },
      sources,
      granularity: activeGranularity,
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}