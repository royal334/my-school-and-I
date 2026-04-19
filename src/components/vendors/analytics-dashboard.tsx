// components/vendors/analytics-dashboard-enhanced.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Phone,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Lock,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  Target,
  Activity,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import Link from 'next/link';

interface AnalyticsDashboardProps {
  vendorId: string;
  tier: 'basic' | 'premium' | 'featured';
}

export default function AnalyticsDashboard({
  vendorId,
  tier,
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'combined' | 'line' | 'bar'>('combined');

  useEffect(() => {
    fetchAnalytics();
  }, [vendorId, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/vendors/${vendorId}/analytics?days=${period}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-sm text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center">
          <p className="text-red-600">Error loading analytics: {error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-slate-600">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, analytics, sources, granularity } = data;

  // Format chart data with all metrics
  const chartData = analytics.map((item: any) => {
    const date = new Date(item.period_start);
    let formattedDate: string;

    if (granularity === 'hour') {
      formattedDate = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (granularity === 'day') {
      formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } else {
      formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    }

    return {
      date: formattedDate,
      views: item.views || 0,
      phoneContacts: item.phone_contacts || 0,
      whatsappContacts: item.whatsapp_contacts || 0,
      totalContacts: item.total_contacts || 0,
      conversionRate: item.view_to_contact_rate || 0,
    };
  });

  // Calculate trends (compare first half vs second half)
  const midPoint = Math.floor(analytics.length / 2);
  const firstHalf = analytics.slice(0, midPoint);
  const secondHalf = analytics.slice(midPoint);

  const firstHalfAvgViews = firstHalf.reduce((acc: number, item: any) => acc + (item.views || 0), 0) / firstHalf.length || 0;
  const secondHalfAvgViews = secondHalf.reduce((acc: number, item: any) => acc + (item.views || 0), 0) / secondHalf.length || 0;
  const viewsTrend = ((secondHalfAvgViews - firstHalfAvgViews) / (firstHalfAvgViews || 1)) * 100;

  const firstHalfAvgContacts = firstHalf.reduce((acc: number, item: any) => acc + (item.total_contacts || 0), 0) / firstHalf.length || 0;
  const secondHalfAvgContacts = secondHalf.reduce((acc: number, item: any) => acc + (item.total_contacts || 0), 0) / secondHalf.length || 0;
  const contactsTrend = ((secondHalfAvgContacts - firstHalfAvgContacts) / (firstHalfAvgContacts || 1)) * 100;

  // Contact type breakdown
  const contactTypeData = [
    {
      name: 'Phone Calls',
      value: summary.phone_contacts || 0,
      color: '#10b981',
    },
    {
      name: 'WhatsApp',
      value: summary.whatsapp_contacts || 0,
      color: '#25D366',
    },
  ].filter((item) => item.value > 0);

  // Performance metrics for radar chart
  const performanceData = [
    {
      metric: 'Views',
      value: Math.min((summary.views / (period === '7' ? 100 : period === '30' ? 300 : 900)) * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'Contacts',
      value: Math.min((summary.total_contacts / (period === '7' ? 20 : period === '30' ? 60 : 180)) * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'Conversion',
      value: Math.min(summary.conversionRate * 10, 100),
      fullMark: 100,
    },
    {
      metric: 'Phone',
      value: Math.min((summary.phone_contacts / (summary.total_contacts || 1)) * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'WhatsApp',
      value: Math.min((summary.whatsapp_contacts / (summary.total_contacts || 1)) * 100, 100),
      fullMark: 100,
    },
  ];

  // Traffic sources (Featured only)
  const sourceData = sources
    ? Object.entries(sources)
        .map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value as number,
        }))
        .filter((item) => item.value > 0)
    : [];

  const hasBasicTier = tier === 'basic';
  const hasPremiumTier = tier === 'premium' || tier === 'featured';
  const hasFeaturedTier = tier === 'featured';

  const hasNoData = summary.views === 0 && summary.total_contacts === 0;

  // Colors for charts
  const COLORS = {
    views: '#3b82f6',
    contacts: '#10b981',
    phone: '#8b5cf6',
    whatsapp: '#25D366',
    conversion: '#f59e0b',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Period Selector */}
        <div className="flex gap-2">
          <Button
            variant={period === '7' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            7 Days
          </Button>
          <Button
            variant={period === '30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            30 Days
          </Button>
          <Button
            variant={period === '90' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            90 Days
          </Button>
        </div>

        {/* Granularity & Refresh */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {granularity === 'hour'
              ? 'Hourly'
              : granularity === 'day'
              ? 'Daily'
              : 'Monthly'}{' '}
            Data
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* No Data Message */}
      {hasNoData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Activity className="mx-auto h-12 w-12 text-blue-400" />
            <h3 className="mt-4 font-semibold text-blue-900">
              No Analytics Data Yet
            </h3>
            <p className="mt-2 text-sm text-blue-700">
              Start getting views and contacts to see analytics here. Share your
              vendor page to start tracking!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Views */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.views.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {viewsTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{viewsTrend.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{viewsTrend.toFixed(1)}%</span>
                </>
              )}
              <span className="text-slate-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Contacts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_contacts.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {contactsTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{contactsTrend.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {contactsTrend.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-slate-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Phone Calls */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Phone Calls
              </CardTitle>
              <Phone className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.phone_contacts.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {summary.total_contacts > 0
                ? ((summary.phone_contacts / summary.total_contacts) * 100).toFixed(
                    1
                  )
                : 0}
              % of contacts
            </p>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                WhatsApp
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.whatsapp_contacts.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {summary.total_contacts > 0
                ? (
                    (summary.whatsapp_contacts / summary.total_contacts) *
                    100
                  ).toFixed(1)
                : 0}
              % of contacts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Card */}
      <Card className="border-purple-200 bg-linear-to-br from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Conversion Rate
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-900">
                  {summary.conversionRate}%
                </span>
                <span className="text-sm text-slate-600">
                  views to contacts
                </span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-4">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-blue-500"
              style={{ width: `${Math.min(summary.conversionRate * 10, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Analytics</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'combined' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('combined')}
              >
                Combined
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasBasicTier ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Lock className="h-12 w-12 text-slate-400" />
              <h3 className="mt-4 font-semibold text-slate-700">
                Detailed Analytics Locked
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upgrade to Premium for daily analytics charts
              </p>
              <Link href={`/dashboard/vendors/${vendorId}/upgrade`}>
                <Button className="mt-4">Upgrade Now</Button>
              </Link>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center text-slate-500">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'combined' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  
                  {/* Views as Area */}
                  <Bar
                    yAxisId="left"
                    type="monotone"
                    dataKey="views"
                    fill={COLORS.views}
                    
                    stroke={COLORS.views}
                    strokeWidth={2}
                    name="Views"
                  />
                  
                  {/* Total Contacts as Bar */}
                  <Bar
                    yAxisId="right"
                    dataKey="totalContacts"
                    fill={COLORS.contacts}
                    name="Total Contacts"
                    radius={[4, 4, 0, 0]}
                  />
                  
                  {/* Phone Contacts as Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="phoneContacts"
                    stroke={COLORS.phone}
                    strokeWidth={2}
                    name="Phone"
                    dot={{ r: 3 }}
                  />
                  
                  {/* WhatsApp as Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="whatsappContacts"
                    stroke={COLORS.whatsapp}
                    strokeWidth={2}
                    name="WhatsApp"
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke={COLORS.views}
                    strokeWidth={3}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalContacts"
                    stroke={COLORS.contacts}
                    strokeWidth={3}
                    name="Contacts"
                  />
                  <Line
                    type="monotone"
                    dataKey="phoneContacts"
                    stroke={COLORS.phone}
                    strokeWidth={2}
                    name="Phone"
                  />
                  <Line
                    type="monotone"
                    dataKey="whatsappContacts"
                    stroke={COLORS.whatsapp}
                    strokeWidth={2}
                    name="WhatsApp"
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill={COLORS.views} name="Views" />
                  <Bar
                    dataKey="totalContacts"
                    fill={COLORS.contacts}
                    name="Contacts"
                  />
                  <Bar
                    dataKey="phoneContacts"
                    fill={COLORS.phone}
                    name="Phone"
                  />
                  <Bar
                    dataKey="whatsappContacts"
                    fill={COLORS.whatsapp}
                    name="WhatsApp"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Secondary Analytics */}
      {hasPremiumTier && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Methods</CardTitle>
            </CardHeader>
            <CardContent>
              {contactTypeData.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-slate-500">
                  No contacts yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={contactTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contactTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Performance Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Traffic Sources (Featured only) */}
      {hasFeaturedTier && (
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-slate-500">
                No traffic data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}