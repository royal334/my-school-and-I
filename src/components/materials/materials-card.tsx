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
    <Card className="flex flex-col transition-shadow hover:shadow-lg border-border">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
            {MATERIAL_TYPE_LABELS[material.type] || "Other"}
          </div>
          <button
            onClick={() => handleSaveMaterial(material.id)}
            className="mt-1 p-2 rounded hover:bg-accent/10 transition"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {loading ? <Loader2 className="text-primary-600 dark:text-primary-400 animate-spin" /> :
          (<Bookmark
            className={`h-5 w-5 ${
              isSaved
                ? 'fill-accent-500 text-accent-500'
                : 'text-muted-foreground'
            }`}
          />)}
          </button>
          {material.is_premium && !hasActiveSubscription && (
            <div className="flex items-center gap-1 rounded-full bg-accent-50 px-2 py-1 dark:bg-accent-500/15">
              <Lock className="h-3 w-3 text-accent-600" />
              <span className="text-xs font-medium text-accent-600 dark:text-accent-300">
                Premium
              </span>
            </div>
          )}
        </div>

        <h3 className="line-clamp-2 font-medium text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>
          {material.title}
        </h3>

        {material.courses && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="truncate">
              {material.courses.course_code} - {material.courses.course_title}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {material.courses && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">Level:</span>
              <span>{material.courses.level}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">Sem:</span>
              <span>{material.courses.semester}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </div>
          {material.file_size_bytes && (
            <span>{formatFileSize(material.file_size_bytes)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(material.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter>
        {canAccess ? (
          <Link href={`/dashboard/materials/${material.id}`} className="w-full">
            <Button onClick={handleViewMaterial} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Eye className="mr-2 h-4 w-4" />
              View material
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <Lock className="mr-2 h-4 w-4" />
            Subscribe to access
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
