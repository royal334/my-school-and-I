'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, X, Calendar } from 'lucide-react';

interface SubscriptionCardProps {
  profile: any;
}

export default function SubscriptionCard({ profile }: SubscriptionCardProps) {
  const isActive =
    profile?.subscription_status === 'active' &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const daysRemaining = profile?.subscription_expires_at
    ? Math.ceil(
        (new Date(profile.subscription_expires_at).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Subscription</h2>
        </div>
        <p className="text-sm text-slate-600">
          Manage your premium subscription and access
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Current Plan</p>
            <p className="text-lg font-bold text-slate-900">
              {isActive ? 'Premium' : 'Free'}
            </p>
          </div>
          <Badge
            className={
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700'
            }
          >
            {isActive ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>

        {/* Expiry Date */}
        {isActive && profile?.subscription_expires_at && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                Expires on{' '}
                {new Date(profile.subscription_expires_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-700">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">
            {isActive ? 'Your Premium Features:' : 'Upgrade to Premium for:'}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? 'bg-green-100' : 'bg-slate-100'
                }`}
              >
                <Check className={`h-3 w-3 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              Access to all premium materials
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? 'bg-green-100' : 'bg-slate-100'
                }`}
              >
                <Check className={`h-3 w-3 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              Unlimited downloads
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? 'bg-green-100' : 'bg-slate-100'
                }`}
              >
                <Check className={`h-3 w-3 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              Priority support
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? 'bg-green-100' : 'bg-slate-100'
                }`}
              >
                <Check className={`h-3 w-3 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              Early access to new features
            </li>
          </ul>
        </div>

        {/* Action Button */}
        {isActive ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              View Payment History
            </Button>
            <p className="text-center text-xs text-slate-500">
              Your subscription will auto-expire. No recurring charges.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Upgrade to Premium - ₦400/semester
            </Button>
            <p className="text-center text-xs text-slate-500">
              One-time payment. Cancel anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}