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
import { User, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ProfileFormProps {
  profile: any;
  email: string;
  userId: string;
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^(\+234|0)[789]\d{9}$/.test(val), {
      message:
        "Invalid Nigerian phone number format (e.g. 080XXXXXXXX or +234XXXXXXXXXX)",
    }),
  level: z.string().min(1, "Level is required"),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({
  profile,
  email,
  userId,
}: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone_number: profile?.phone_number || "",
      level: profile?.level?.toString() || "",
      bio: profile?.bio || "",
    },
  });

  const watchFullName = watch("full_name");
  const watchBio = watch("bio");

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number || null,
          level: parseInt(data.level),
          bio: data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </div>
        <p className="text-sm text-slate-600">
          Update your personal details and contact information
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section (Future Enhancement) */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {watchFullName
                ?.split(" ")
                .map((n: any) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {watchFullName || "Your Name"}
              </p>
              <p className="text-sm text-slate-600">{email}</p>
              {/* Future: Add upload button */}
              {/* <Button type="button" variant="outline" size="sm" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Change Photo
              </Button> */}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="full_name"
                className={errors.full_name ? "text-red-500" : ""}
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...register("full_name")}
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-xs text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className={errors.phone_number ? "text-red-500" : ""}
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="08012345678 or +2348012345678"
                {...register("phone_number")}
                className={errors.phone_number ? "border-red-500" : ""}
              />
              {errors.phone_number ? (
                <p className="text-xs text-red-500">
                  {errors.phone_number.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Nigerian format: 080XXXXXXXX or +234XXXXXXXXXX
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            {/* Matric Number (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="matric_number">Matric Number</Label>
              <Input
                id="matric_number"
                value={profile?.matric_number || "N/A"}
                disabled
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">
                Matric number cannot be changed
              </p>
            </div>
          </div>

          {/* Current Level */}
          <div className="space-y-2">
            <Label
              htmlFor="level"
              className={errors.level ? "text-red-500" : ""}
            >
              Current Level <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={errors.level ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level ? (
              <p className="text-xs text-red-500">{errors.level.message}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Update this when you advance to the next level
              </p>
            )}
          </div>

          {/* Bio (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="bio" className={errors.bio ? "text-red-500" : ""}>
              Bio (Optional)
            </Label>
            <textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              {...register("bio")}
              className={`min-h-[100px] w-full rounded-lg border ${errors.bio ? "border-red-500" : "border-slate-300"} px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100`}
              maxLength={500}
            />
            {errors.bio ? (
              <p className="text-xs text-red-500">{errors.bio.message}</p>
            ) : (
              <p className="text-xs text-slate-500">
                {watchBio?.length || 0} / 500 characters
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
