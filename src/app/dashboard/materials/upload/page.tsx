import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCourses } from "@/utils/supabase/queries";
import UploadForm from "@/components/materials/upload-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UploadMaterialPage() {
  const supabase = createClient(await cookies());

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is super_admin
  const { data: roleData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!roleData || roleData.role !== "super_admin") {
    return (
      <div className="p-10 space-y-4">
        <div className="p-6 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="text-lg font-bold">Access Denied</h2>
          <p>
            You are logged in as {user.email}, but you do not have
            super admin permissions to upload materials.
          </p>
          <p className="text-sm mt-2 opacity-70">User ID: {user.id}</p>
        </div>
        <Link href="/dashboard/materials">
          <Button variant="outline">Back to Materials</Button>
        </Link>
      </div>
    );
  }

  // Get all courses for the dropdown
  const courses = await getCourses({}, supabase);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/materials">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
      </Link>

      {/* Upload Form */}
      <UploadForm courses={courses} />
    </div>
  );
}
