// components/vendors/analytics-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Phone,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Lock,
  Crown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Link from 'next/link';

interface AnalyticsDashboardProps {
  vendorId: string;
  tier: 'basic' | 'premium' | 'featured';
}

export default function AnalyticsDashboard({ vendorId, tier }: AnalyticsDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchAnalytics();
  }, [vendorId, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendorId}/analytics?days=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading analytics...</p>
        </div>
      </div>
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

  const { summary, analytics, sources } = data;

  // Format chart data
  const chartData = analytics.map((item: any) => ({
    date: new Date(item.period_start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    views: item.views,
    contacts: item.total_contacts,
  }));

  // Contact type breakdown
  const contactTypeData = [
    { name: 'Phone Calls', value: summary.phone_contacts, color: '#10b981' },
    { name: 'WhatsApp', value: summary.whatsapp_contacts, color: '#25D366' },
  ];

  // Traffic sources (Featured only)
  const sourceData = sources
    ? Object.entries(sources).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value as number,
      }))
    : [];

  const hasBasicTier = tier === 'basic';
  const hasPremiumTier = tier === 'premium' || tier === 'featured';
  const hasFeaturedTier = tier === 'featured';

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={period === '7' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7')}
          >
            7 Days
          </Button>
          <Button
            variant={period === '30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30')}
          >
            30 Days
          </Button>
          <Button
            variant={period === '90' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90')}
          >
            90 Days
          </Button>
        </div>

        <Badge variant="outline" className="text-sm">
          {tier === 'featured' ? 'Hourly' : tier === 'premium' ? 'Daily' : 'Monthly'} Data
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <div className="text-2xl font-bold">{summary.views.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Last {period} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Phone Calls
              </CardTitle>
              <Phone className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.phone_contacts.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Direct calls</p>
          </CardContent>
        </Card>

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
            <p className="text-xs text-slate-500 mt-1">WhatsApp chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.conversionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Views to contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {hasBasicTier ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Lock className="h-12 w-12 text-slate-400" />
              <h3 className="mt-4 font-semibold text-slate-700">
                Detailed Analytics Locked
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upgrade to Premium for daily analytics
              </p>
              <Link href={`/dashboard/vendors/${vendorId}/upgrade`}>
                <Button className="mt-4">Upgrade Now</Button>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="views"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Contacts"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Contact Type Breakdown */}
      {hasPremiumTier && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contactTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent === undefined ? 0 : percent * 100).toFixed(0)}%`
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
            </CardContent>
          </Card>

          {/* Traffic Sources (Featured only) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Traffic Sources</CardTitle>
                {!hasFeaturedTier && (
                  <Badge variant="outline">
                    <Crown className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasFeaturedTier && sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <Lock className="h-10 w-10 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Traffic Sources Locked
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Upgrade to Featured for source tracking
                  </p>
                  <Link href={`/dashboard/vendors/${vendorId}/upgrade?tier=featured`}>
                    <Button size="sm" className="mt-3">
                      Upgrade to Featured
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights (Featured only) */}
      {hasFeaturedTier && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Peak Traffic Time</h4>
                  <p className="text-sm text-blue-700">
                    Most views occur between 2 PM - 5 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Best Performing Day</h4>
                  <p className="text-sm text-green-700">
                    Thursdays show 23% higher engagement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}