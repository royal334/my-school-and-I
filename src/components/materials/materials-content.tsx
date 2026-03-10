"use client";

import { Card } from "@/components/ui/card";
import MaterialCard from "./materials-card";
import { FileX } from "lucide-react";

import { Material, MaterialsContentProps } from "@/utils/types";

export default function MaterialsContent({
  materials,
  profile,
}: MaterialsContentProps) {
  const hasActiveSubscription =
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  if (materials.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <FileX className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No materials found
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Try adjusting your filters or search terms
        </p>
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
        />
      ))}
    </div>
  );
}
