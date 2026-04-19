// components/dashboard/vendor-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  Crown,
  Edit,
  BarChart3,
  Users,
  MessageSquare,
  AlertCircle,
  Store,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface VendorDashboardProps {
  profile: any;
  vendor: any;
}

export default function VendorDashboard({ profile, vendor }: VendorDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!vendor?.id) return;
      try {
        const response = await fetch(`/api/vendors/${vendor.id}/analytics?days=30`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [vendor?.id]);

  const isVerified = vendor?.is_verified || vendor?.subscription_tier === 'featured';
  
  // Use 30-day stats if available, otherwise fallback to lifetime (with a note)
  const views = analytics ? analytics.summary.views : vendor.view_count;
  const contacts = analytics ? analytics.summary.total_contacts : vendor.contact_count;
  const conversionRate = views > 0
    ? ((contacts / views) * 100).toFixed(1)
    : '0.0';

  // Trends (using a simple comparison if we had historical data, but for now we'll just show the 30d total)
  // In a real scenario, the API would return trend percentages.
  const viewsTrend = 0; 
  const contactsTrend = 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile.full_name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your business in the last 30 days
        </p>
      </div>

      {/* Quick Actions */}
      {!vendor && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/30">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-blue-900">
                Create Your Vendor Listing
              </h3>
              <p className="mb-3 text-sm text-blue-800">
                Start connecting with thousands of students by listing your business
              </p>
              <Link href="/vendor-signup">
                <Button size="sm">Create Listing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {vendor && (
        <>
          {/* Pending Approval Notice */}
          {!vendor.is_approved && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-amber-900">
                  ⏳ Your listing is pending admin approval. It will be visible to
                  students once approved.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{views}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Last 30 days
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Contacts
                  </CardTitle>
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{contacts}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Last 30 days
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {vendor.rating_avg.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">/ 5.0</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {vendor.rating_count} reviews
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{conversionRate}%</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Views to contacts
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Vendor Info */}
            <div className="space-y-6 lg:col-span-2">
              {/* Vendor Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div>
                      {vendor.logo_url ? (
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                          <Image
                            src={vendor.logo_url}
                            alt={vendor.business_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary-100 text-xl font-bold text-primary-700">
                          {vendor.business_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="text-lg font-bold">
                              {vendor.business_name}
                            </h3>
                            {isVerified && (
                              <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white" />
                            )}
                          </div>
                          {vendor.vendor_categories && (
                            <p className="text-sm text-muted-foreground">
                              {vendor.vendor_categories.icon}{' '}
                              {vendor.vendor_categories.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {vendor.is_featured && (
                            <Badge className="bg-amber-500">
                              <Crown className="mr-1 h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                          {/* <Badge
                            variant={vendor.is_approved ? 'default' : 'secondary'}
                            className={
                              vendor.is_approved
                                ? 'bg-green-500'
                                : 'bg-amber-500 text-white'
                            }
                          >
                            {vendor.is_approved ? 'Approved' : 'Pending'}
                          </Badge> */}
                          {isVerified && (
                            <Badge className="bg-blue-500 text-white">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                        {vendor.description}
                      </p>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/vendors/${vendor.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </Button>
                        </Link>
                        <Link href={`/dashboard/vendors/${vendor.id}`}>
                          <Button variant="outline" size="sm">
                            View Public Page
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Chart Placeholder */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {vendor.subscription_tier === 'basic'
                          ? 'Upgrade to Premium to see detailed analytics'
                          : 'Analytics chart coming soon'}
                      </p>
                      {vendor.subscription_tier === 'basic' && (
                        <Link href={`/dashboard/vendors/${vendor.id}/upgrade`}>
                          <Button size="sm" className="mt-3">
                            Upgrade Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-lg font-semibold uppercase"
                    >
                      {vendor.subscription_tier}
                    </Badge>
                    {vendor.subscription_tier === 'basic' && (
                      <Crown className="h-6 w-6 text-amber-500" />
                    )}
                  </div>

                  {vendor.subscription_tier === 'basic' ? (
                    <>
                      <p className="mb-3 text-sm text-muted-foreground">
                        Upgrade to unlock premium features and boost your visibility
                      </p>
                      <Link href={`/dashboard/vendors/${vendor.id}/upgrade`}>
                        <Button className="w-full">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Active subscription</span>
                        </div>
                        {vendor.subscription_expires_at && (
                          <p className="text-muted-foreground">
                            Renews on{' '}
                            {new Date(
                              vendor.subscription_expires_at
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Link href="/dashboard/subscription">
                        <Button variant="outline" className="w-full">
                          Manage Subscription
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>



              {/* Help Card */}
              {/* <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/30">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">
                    Need Help?
                  </h3>
                  <p className="mb-3 text-sm text-blue-800">
                    Check our vendor guide or contact support
                  </p>
                  <Link href="/dashboard/support">
                    <Button size="sm" variant="outline" className="w-full">
                      Get Support
                    </Button>
                  </Link>
                </CardContent>
              </Card> */}
            </div>
                {/* Quick Actions */}
                <div className='lg:col-span-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/dashboard/vendors/my-listings">
                      <Button variant="outline" className="w-full justify-start">
                        <Store className="mr-2 h-4 w-4" />
                        Manage Listing
                      </Button>
                    </Link>
                    <Link href="/dashboard/vendors/analytics">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                    </Link>
                    <Link href="/dashboard/notifications">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Notifications
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Account Settings
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
          </div>
        </>
      )}
    </div>
  );
}
