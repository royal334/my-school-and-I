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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="student-stats">
      <Link href="/dashboard/cgpa">
        <Card className="border-primary-200 bg-primary-50/70transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-primary-900 dark:bg-primary-950/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                CGPA
              </span>
              <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-300">
              {currentGPA ? currentGPA.toFixed(2) : "---"}
            </div>
            <Link
              href="/dashboard/cgpa"
              className="mt-2 inline-block text-xs font-medium text-primary-600 dark:text-[#7EC8A0] hover:text-primary-700 dark:hover:text-[#A8D8C2] transition-colors"
            >
              View details →
            </Link>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/materials">
        <Card className="border-primary-200 bg-primary-50/70transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-primary-900 dark:bg-primary-950/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                Materials
              </span>
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary-900 dark:text-primary-300">
            {materialsCount}
          </div>
          <Link
            href="/dashboard/materials"
            className="mt-2 inline-block text-xs font-medium text-primary-600 dark:text-[#7EC8A0] hover:text-primary-700 dark:hover:text-[#A8D8C2] transition-colors"
          >
            Browse library →
          </Link>
        </CardContent>
      </Card>
      </Link>

      <Link href="/dashboard/market?tab=vendors">
        <Card className="border-accent-200 bg-accent-50/50 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-accent-900 dark:bg-accent-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
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
            href="/dashboard/market?tab=vendors"
            className="mt-2 inline-block text-xs font-medium text-[#E8A020] dark:text-[#E8A020] hover:text-[#C4850A] dark:hover:text-[#FFD07A] transition-colors"
          >
            Explore vendors →
          </Link>
        </CardContent>
      </Card>
      </Link>

      <Link href="/suggestion-page">
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
            <div className="text-2xl font-bold text-[#141F1B] dark:text-[#E8F5EF]">
              Make it better
            </div>
            <Link
              href="/suggestion-page"
              className="mt-2 inline-block text-xs font-medium text-[#4A8C73] dark:text-[#7EC8A0] hover:text-[#3A7260] dark:hover:text-[#A8D8C2] transition-colors"
            >
              Share feedback →
            </Link>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
