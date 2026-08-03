"use client";

import { Card } from "@/components/ui/card";
import MaterialCard from "./materials-card";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MaterialsContentProps } from "@/utils/types";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";


export default function MaterialsContent({
  materials,
  profile,
}: MaterialsContentProps) {
  const hasActiveSubscription =
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    async function fetchSavedMaterials() {
      try {
        const response = await fetch("/api/materials/saved");
        if (!response.ok) return;

        const data = await response.json();
        if (!active) return;
        setSavedIds(
          new Set(
            data.saved?.map((s: { material_id: string }) => s.material_id) || []
          )
        );
      } catch (error) {
        console.error("Failed to fetch saved materials:", error);
      }
    }

    fetchSavedMaterials();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleSave = useCallback(
    async (materialId: string) => {
      try {
        const response = await fetch(`/api/materials/${materialId}/bookmark`, {
          method: savedIds.has(materialId) ? "DELETE" : "POST",
        });
        if (!response.ok) throw new Error("Failed to save material");

        const data = await response.json();
        setSavedIds(
          new Set(
            data.saved?.map((s: { material_id: string }) => s.material_id) || []
          )
        );
      } catch (error) {
        console.error("Save error:", error);
      }
    },
    [savedIds]
  );

  if (materials.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
          <FileX className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          No materials found
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Try adjusting your filters or search terms
        </p>
        <div className="space-y-4">
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Not seeing what you&apos;re  looking for?</p>
          <Link href="/submit-materials" >
            <Button>
              <Upload className="h-4 w-4" />
              Submit Materials for Review
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          hasActiveSubscription={hasActiveSubscription}
          isSaved={savedIds.has(material.id)}
          onToggleSave={handleToggleSave}
        />
      ))}
    </div>
  );
}
