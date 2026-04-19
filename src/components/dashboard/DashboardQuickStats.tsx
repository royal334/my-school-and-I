import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Calculator, Download, Store } from "lucide-react";
import Link from "next/link";

import { DashboardQuickStatsProps } from "@/utils/types";

export function DashboardQuickStats({
  currentGPA,
  materialsCount,
  vendorsCount,
  dailyDownloadCount,
}: DashboardQuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary-200 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-900/30 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              CGPA
            </span>
            <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary-900 dark:text-white">
            {currentGPA ? currentGPA.toFixed(2) : "---"}
          </div>
          <Link
            href="/dashboard/cgpa"
            className="mt-2 inline-block text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View details →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-secondary-200 bg-secondary-50 dark:bg-secondary-950/30 dark:border-secondary-900/30 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Materials
            </span>
            <BookOpen className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary-900 dark:text-white">
            {materialsCount}
          </div>
          <Link
            href="/dashboard/materials"
            className="mt-2 inline-block text-xs font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
          >
            Browse library →
          </Link>
        </CardContent>
      </Card>

      {/* <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/30 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Downloads Today
            </span>
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-white">
            {dailyDownloadCount} / 10
          </div>
          <p className="mt-2 text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">
            Resets daily
          </p>
        </CardContent>
      </Card> */}

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Vendors
            </span>
            <Store className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900 dark:text-white">
            {vendorsCount}
          </div>
          <Link
            href="/dashboard/vendors"
            className="mt-2 inline-block text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            Explore vendors →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
