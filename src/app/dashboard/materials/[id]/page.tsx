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
                  <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                    {material.title}
                  </h1>
                  {material.courses && (
                    <div className="flex items-center gap-2 text-muted-foreground">
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
                  <h3 className="font-semibold text-foreground">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {material.description}
                  </p>
                </div>
              )}
              {/* File Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-foreground">
                      File Type:
                    </span>
                    <span className="ml-2 text-muted-foreground">PDF</span>
                  </div>
                </div>
                {material.file_size_bytes && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">Size:</span>
                      <span className="ml-2 text-muted-foreground">
                        {formatFileSize(material.file_size_bytes)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {/* <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">Views:</span>
                      <span className="ml-2 text-muted-foreground">
                        {material.view_count}
                      </span>
                    </div> */}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {/* <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">
                        Downloads:
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {material.download_count}
                      </span>
                    </div> */}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-foreground">
                      Uploaded:
                    </span>
                    <span className="ml-2 text-muted-foreground">
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
                <h3 className="font-semibold text-foreground">
                  Course Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Course Code
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {material.courses.course_code}
                    </p>
                  </div>
                  <div>
                    <MaterialsDownloadButton material= { material } />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Course Title
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {material.courses.course_title}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Level
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {material.courses.level}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Semester
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {material.courses.semester}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Credits
                    </span>
                    <p className="text-sm text-muted-foreground">
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
              <h3 className="font-semibold text-foreground">
                Related Materials
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
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
          <div className="mx-auto rounded-full bg-accent-100 dark:bg-accent-950/50 p-4 w-fit">
            <Lock className="h-8 w-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Premium Material
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Subscribe for ₦1000/semester to access this material
          </p>
          <Button className="mt-4">Upgrade to Premium</Button>
        </Card>
      )}
    </div>
  );
}
