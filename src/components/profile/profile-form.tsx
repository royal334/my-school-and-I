"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, CreditCard, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

import { ProfileFormProps } from "@/utils/types";

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone_number || "",
    level: profile?.level?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          level: parseInt(formData.level),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matric_number">Matric Number</Label>
              <Input
                id="matric_number"
                value={profile?.matric_number}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                Matric number cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="e.g., 08012345678"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Current Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Subscription</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Status</p>
              <p className="text-sm text-slate-600">
                {profile?.subscription_status === "active"
                  ? "Premium Active"
                  : "Free Plan"}
              </p>
            </div>
            {profile?.subscription_status === "active" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Active
              </span>
            ) : (
              <Button>Upgrade to Premium</Button>
            )}
          </div>

          {profile?.subscription_expires_at && (
            <div>
              <p className="text-sm text-slate-600">
                Expires on:{" "}
                {new Date(profile.subscription_expires_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>

          <form action="/api/auth/logout" method="POST" className="w-full">
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
            >
              <Lock className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
