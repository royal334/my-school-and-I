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
  dailyDownloadCount,
}: DashboardQuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="student-stats">
      <Card className="border-[#A8D8C2] bg-[#E8F5EF] dark:bg-white/5 dark:border-white/10 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3A7260] dark:text-[#7EC8A0]">
              CGPA
            </span>
            <Calculator className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#1A3C34] dark:text-[#E8F5EF]">
            {currentGPA ? currentGPA.toFixed(2) : "---"}
          </div>
          <Link
            href="/dashboard/cgpa"
            className="mt-2 inline-block text-xs font-medium text-[#4A8C73] dark:text-[#7EC8A0] hover:text-[#3A7260] dark:hover:text-[#A8D8C2] transition-colors"
          >
            View details →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[#A8D8C2] bg-[#E8F5EF] dark:bg-white/5 dark:border-white/10 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3A7260] dark:text-[#7EC8A0]">
              Materials
            </span>
            <BookOpen className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#1A3C34] dark:text-[#E8F5EF]">
            {materialsCount}
          </div>
          <Link
            href="/dashboard/materials"
            className="mt-2 inline-block text-xs font-medium text-[#4A8C73] dark:text-[#7EC8A0] hover:text-[#3A7260] dark:hover:text-[#A8D8C2] transition-colors"
          >
            Browse library →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[#D6E5DF] bg-white dark:bg-[#171918] dark:border-white/10 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E]">
              Vendors
            </span>
            <Store className="h-5 w-5 text-[#E8A020] dark:text-[#E8A020]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#141F1B] dark:text-[#E8F5EF]">
            {vendorsCount}
          </div>
          <Link
            href="/dashboard/vendors"
            className="mt-2 inline-block text-xs font-medium text-[#E8A020] dark:text-[#E8A020] hover:text-[#C4850A] dark:hover:text-[#FFD07A] transition-colors"
          >
            Explore vendors →
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[#D6E5DF] bg-white dark:bg-[#171918] dark:border-white/10 transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7B75] dark:text-[#9BA19E]">
              Suggestions
            </span>
            <MessageSquare className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#141F1B] dark:text-[#E8F5EF]">
            Feedback
          </div>
          <Link
            href="/suggestion-page"
            className="mt-2 inline-block text-xs font-medium text-[#4A8C73] dark:text-[#7EC8A0] hover:text-[#3A7260] dark:hover:text-[#A8D8C2] transition-colors"
          >
            Give feedback →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
