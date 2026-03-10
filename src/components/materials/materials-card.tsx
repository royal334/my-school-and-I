"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Lock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/utils/lib/index";
import { MATERIAL_TYPE_LABELS } from "@/utils/constants/constants";
import Link from "next/link";

import { MaterialCardProps } from "@/utils/types";

export default function MaterialCard({
  material,
  hasActiveSubscription,
}: MaterialCardProps) {
  const canAccess = !material.is_premium || hasActiveSubscription;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-2">
        {/* Type Badge and Premium Lock */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {MATERIAL_TYPE_LABELS[material.type] || "Other"}
          </Badge>
          {material.is_premium && !hasActiveSubscription && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1">
              <Lock className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-slate-900">
          {material.title}
        </h3>

        {/* Course Info */}
        {material.courses && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BookOpen className="h-4 w-4" />
            <span className="truncate">
              {material.courses.course_code} - {material.courses.course_title}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Level and Semester */}
        {material.courses && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-medium">Level:</span>
              <span>{material.courses.level}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-medium">Sem:</span>
              <span>{material.courses.semester}</span>
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </div>
          {material.file_size_bytes && (
            <span>{formatFileSize(material.file_size_bytes)}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{material.view_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{material.download_count}</span>
          </div>
        </div>

        {/* Upload Date */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(material.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter>
        {canAccess ? (
          <Link href={`/dashboard/materials/${material.id}`} className="w-full">
            <Button className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Material
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <Lock className="mr-2 h-4 w-4" />
            Subscribe to Access
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
