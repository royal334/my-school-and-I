import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getMaterialById } from "@/utils/supabase/queries";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  BookOpen,
  Lock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatFileSize, formatDate } from "@/utils/lib";
import { MATERIAL_TYPE_LABELS } from "@/utils/constants/constants";
import PDFViewerWrapper from "@/components/pdf/pdf-viewer-wrapper";
import MaterialsDownloadButton from "@/components/materials/download-button";
import MaterialReportMenu from "@/components/materials/material-report-menu";

interface PageProps {
  params: Promise<{id: string;}>;
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const supabase = createClient(await cookies());
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { id } = await params;

  // Get material
  const material = await getMaterialById(id, supabase);

  if (!material) {
    return notFound();
  }

  // Check access
  const hasActiveSubscription =
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const canAccess = !material.is_premium || hasActiveSubscription;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/materials">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Content - Left Side */}

        {/* Material Info Card */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {MATERIAL_TYPE_LABELS[material.type] || "Other"}
                    </Badge>
                    {material.is_premium && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {material.title}
                  </h1>
                  {material.courses && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">
                        {material.courses.course_code} -{" "}
                        {material.courses.course_title}
                      </span>
                    </div>
                  )}
                </div>
                <MaterialReportMenu
                  materialId={material.id}
                  materialTitle={material.title}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              {material.description && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Description</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {material.description}
                  </p>
                </div>
              )}
              {/* File Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      File Type:
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">PDF</span>
                  </div>
                </div>
                {material.file_size_bytes && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Size:</span>
                      <span className="ml-2 text-slate-600 dark:text-slate-400">
                        {formatFileSize(material.file_size_bytes)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {/* <Eye className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-medium text-slate-900">Views:</span>
                      <span className="ml-2 text-slate-600">
                        {material.view_count}
                      </span>
                    </div> */}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {/* <Download className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-medium text-slate-900">
                        Downloads:
                      </span>
                      <span className="ml-2 text-slate-600">
                        {material.download_count}
                      </span>
                    </div> */}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      Uploaded:
                    </span>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      {formatDate(material.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Course Details */}
          {material.courses && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Course Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Course Code
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {material.courses.course_code}
                    </p>
                  </div>
                  <div>
                    <MaterialsDownloadButton material= { material } />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Course Title
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {material.courses.course_title}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Level
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {material.courses.level}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Semester
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {material.courses.semester}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Credits
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {material.courses.credit_units}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Materials
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">
                Related Materials
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                More materials from this course coming soon...
              </p>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* PDF Preview */}
      {canAccess ? (
        <PDFViewerWrapper
          materialId={material.id}
          fileName={material.file_name}
        />
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 p-4 w-fit">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Premium Material
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Subscribe for ₦1000/semester to access this material
          </p>
          <Button className="mt-4">Upgrade to Premium</Button>
        </Card>
      )}
    </div>
  );
}
