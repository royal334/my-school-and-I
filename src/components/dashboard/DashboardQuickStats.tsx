import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BookOpen,
  Calculator,
  MessageSquare,
  Store,
} from "lucide-react";
import Link from "next/link";
import { DashboardQuickStatsProps } from "@/utils/types";

export function DashboardQuickStats({
  currentGPA,
  materialsCount,
  vendorsCount,
}: DashboardQuickStatsProps) {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      data-tour="student-stats"
    >
      <Card className="border-primary-200 bg-primary-50/70 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-primary-900 dark:bg-primary-950/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              CGPA
            </span>
            <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">
            {currentGPA ? currentGPA.toFixed(2) : "---"}
          </div>
          <Link
            href="/dashboard/cgpa"
            className="mt-2 inline-block text-xs font-semibold text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            View details →
          </Link>
        </CardContent>
      </Card>

      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              Materials
            </span>
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">
            {materialsCount}
          </div>
          <Link
            href="/dashboard/materials"
            className="mt-2 inline-block text-xs font-semibold text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Browse library →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-accent-200 bg-accent-50/50 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-accent-900 dark:bg-accent-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-accent-800 dark:text-accent-300">
              Vendors
            </span>
            <Store className="h-5 w-5 text-accent-600 dark:text-accent-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">
            {vendorsCount}
          </div>
          <Link
            href="/dashboard/vendors"
            className="mt-2 inline-block text-xs font-semibold text-accent-700 transition-colors hover:text-accent-900 dark:text-accent-300 dark:hover:text-accent-200"
          >
            Explore vendors →
          </Link>
        </CardContent>
      </Card>

      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              Feedback
            </span>
            <MessageSquare className="h-5 w-5 text-info" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-foreground">
            Make it better
          </div>
          <Link
            href="/suggestion-page"
            className="mt-2 inline-block text-xs font-semibold text-info transition-colors hover:text-info-text"
          >
            Share feedback →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
