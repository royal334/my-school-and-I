// app/dashboard/vendors/my-listings/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Phone,
  Star,
  Edit,
  TrendingUp,
  Crown,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'My Listings | EngiPortal',
  description: 'Manage your vendor listings',
};

export default async function MyListingsPage() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's vendor listing
  const { data: vendor } = await supabase
    .from('vendors')
    .select(`
      *,
      vendor_categories (
        name,
        icon
      )
    `)
    .eq('owner_id', user.id)
    .single();

  const isVerified = vendor?.is_verified || vendor?.subscription_tier === 'featured';

  // If no vendor, show create prompt
  if (!vendor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-slate-600">Manage your vendor listings</p>
        </div>

        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-primary-100 p-4">
            <Plus className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No vendor listing yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Create your first vendor listing to start connecting with students
          </p>
          <Link href="/dashboard/vendors/create">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Vendor Listing
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-slate-600">Manage your vendor listings</p>
        </div>
        <Link href={`/dashboard/vendors/${vendor.id}`}>
          <Button variant="outline">View Public Page</Button>
        </Link>
      </div>

      {/* Pending Approval Notice */}
      {!vendor.is_approved && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-900">
              ⏳ Your listing is pending admin approval. It will be visible to
              students once approved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Views</p>
                <p className="text-2xl font-bold">{vendor.view_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Contacts</p>
                <p className="text-2xl font-bold">{vendor.contact_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Rating</p>
                <p className="text-2xl font-bold">
                  {vendor.rating_avg.toFixed(1)} ⭐
                </p>
                <p className="text-xs text-slate-500">
                  {vendor.rating_count} reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Conversion</p>
                <p className="text-2xl font-bold">
                  {vendor.view_count > 0
                    ? ((vendor.contact_count / vendor.view_count) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Details Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div>
              {vendor.logo_url ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                  <Image
                    src={vendor.logo_url}
                    alt={vendor.business_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary-100 text-2xl font-bold text-primary-700">
                  {vendor.business_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-2xl font-bold">{vendor.business_name}</h2>
                    {isVerified && (
                      <CheckCircle2 className="h-5 w-5 fill-blue-500 text-white" />
                    )}
                  </div>
                  {vendor.vendor_categories && (
                    <p className="text-slate-600">
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
                  <Badge
                    variant={vendor.is_approved ? 'default' : 'secondary'}
                    className={
                      vendor.is_approved
                        ? 'bg-green-500'
                        : 'bg-amber-500 text-white'
                    }
                  >
                    {vendor.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                  {isVerified && (
                    <Badge className="bg-blue-500 text-white">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {vendor.subscription_tier.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <p className="mb-4 text-sm text-slate-600">
                {vendor.description}
              </p>

              {/* Services */}
              <div className="mb-4 flex flex-wrap gap-1">
                {vendor.services.map((service: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-sm text-slate-600">
                <p>📞 {vendor.phone_number}</p>
                {vendor.whatsapp_number && (
                  <p>💬 {vendor.whatsapp_number}</p>
                )}
                {vendor.location && <p>📍 {vendor.location}</p>}
                {vendor.operating_hours && <p>🕒 {vendor.operating_hours}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/dashboard/vendors/${vendor.id}/edit`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Edit Listing</h3>
                <p className="text-sm text-slate-600">
                  Update business information
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/vendors/${vendor.id}/analytics`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-slate-600">Track your performance</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {vendor.subscription_tier === 'basic' && (
          <Link href={`/dashboard/vendors/${vendor.id}/upgrade`}>
            <Card className="cursor-pointer border-2 border-amber-200 bg-amber-50 transition-shadow hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-amber-500 p-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-amber-700">
                    Get more visibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}