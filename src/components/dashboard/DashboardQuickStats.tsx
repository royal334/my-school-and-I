import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Calculator, Download, Store } from 'lucide-react';
import Link from 'next/link';

type DashboardQuickStatsProps = {
  currentGPA: number | null;
  materialsCount: number;
  vendorsCount: number;
  dailyDownloadCount: number;
};

export function DashboardQuickStats({
  currentGPA,
  materialsCount,
  vendorsCount,
  dailyDownloadCount,
}: DashboardQuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">CGPA</span>
            <Calculator className="h-4 w-4 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {currentGPA ? currentGPA.toFixed(2) : '---'}
          </div>
          <Link
            href="/dashboard/cgpa"
            className="mt-2 text-xs text-primary-600 hover:text-primary-700"
          >
            View details →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Materials</span>
            <BookOpen className="h-4 w-4 text-secondary-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {materialsCount}
          </div>
          <Link
            href="/dashboard/materials"
            className="mt-2 text-xs text-secondary-600 hover:text-secondary-700"
          >
            Browse library →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Downloads Today</span>
            <Download className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {dailyDownloadCount} / 10
          </div>
          <p className="mt-2 text-xs text-slate-500">Resets daily</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Vendors</span>
            <Store className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {vendorsCount}
          </div>
          <Link
            href="/dashboard/vendors"
            className="mt-2 text-xs text-amber-600 hover:text-amber-700"
          >
            Explore vendors →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

