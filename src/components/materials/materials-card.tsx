"use client";

import { useState } from "react";
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
  Eye,
  Lock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/utils/lib/index";
import { MATERIAL_TYPE_LABELS } from "@/utils/constants/constants";
import Link from "next/link";
import { usePostHogAnalytics } from "../../hooks/posthog-events";
import { MaterialCardProps } from "@/utils/types";
import { POSTHOG_EVENTS } from "@/utils/constants/constants";
import { Bookmark, Loader2 } from "lucide-react";

export default function MaterialCard({
  material,
  hasActiveSubscription,
  isSaved,
  onToggleSave,
}: MaterialCardProps) {
  const canAccess = !material.is_premium || hasActiveSubscription;
  const { track } = usePostHogAnalytics();

  const [loading, setLoading] = useState(false);

  async function handleSaveMaterial(materialId: string) {
    setLoading(true);
    try {
      await onToggleSave(materialId);
    } finally {
      setLoading(false);
    }
  }

  const handleViewMaterial = () => {
    track(POSTHOG_EVENTS.materialsViewed, {
      material_id: material.id,
      material_title: material.title,
      material_type: material.type,
    });
  }

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-2">
        {/* Type Badge and Premium Lock */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {MATERIAL_TYPE_LABELS[material.type] || "Other"}
          </Badge>
          <button
            onClick={() => handleSaveMaterial(material.id)}
            className="mt-1 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={
              isSaved
                ? 'Unsave'
                : 'Save'
            }
          >
          {loading ? <Loader2 className="text-blue-500 a"/>  : 
          (<Bookmark
            className={`h-5 w-5 ${
              isSaved
                ? 'fill-amber-500 text-amber-500'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />)}
          </button>
          {material.is_premium && !hasActiveSubscription && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 dark:bg-amber-950/50">
              <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-slate-900 text-xl md:text-2xl dark:text-slate-100">
          {material.title}
        </h3>

        {/* Course Info */}
        {material.courses && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span className="font-medium">Level:</span>
              <span>{material.courses.level}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span className="font-medium">Sem:</span>
              <span>{material.courses.semester}</span>
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </div>
          {material.file_size_bytes && (
            <span>{formatFileSize(material.file_size_bytes)}</span>
          )}
        </div>

        {/* Stats
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{material.view_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{material.download_count}</span>
          </div>
        </div> */}

        {/* Upload Date */}
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(material.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter>
        {canAccess ? (
          <Link href={`/dashboard/materials/${material.id}`} className="w-full">
            <Button onClick= {handleViewMaterial} className="w-full">
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
