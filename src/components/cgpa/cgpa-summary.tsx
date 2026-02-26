'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, Award, BookOpen } from 'lucide-react';
import { getClassOfDegree, getGPAColor } from '@/utils/lib/cgpa-helpers';

interface CGPASummaryProps {
  currentSemesterGPA: number | null;
  cumulativeCGPA: number;
  totalCreditUnits: number;
}

export default function CGPASummary({
  currentSemesterGPA,
  cumulativeCGPA,
  totalCreditUnits,
}: CGPASummaryProps) {
  const classOfDegree = getClassOfDegree(cumulativeCGPA);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Current Semester GPA */}
      <Card className="border-primary-200 bg-primary-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              Current Semester GPA
            </span>
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent>
          {currentSemesterGPA !== null ? (
            <div className="text-3xl font-bold text-primary-900">
              {currentSemesterGPA.toFixed(2)}
              <span className="text-base font-normal text-primary-600">
                {' '}
                / 5.0
              </span>
            </div>
          ) : (
            <div className="text-sm text-primary-600">
              No semester added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cumulative CGPA */}
      <Card className="border-secondary-200 bg-secondary-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary-700">
              Cumulative CGPA
            </span>
            <Award className="h-5 w-5 text-secondary-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary-900">
            {cumulativeCGPA.toFixed(2)}
            <span className="text-base font-normal text-secondary-600">
              {' '}
              / 5.0
            </span>
          </div>
          <div className="mt-1 text-xs text-secondary-700">
            {totalCreditUnits} total credit units
          </div>
        </CardContent>
      </Card>

      {/* Class of Degree */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700">
              Class of Degree
            </span>
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">
            {cumulativeCGPA > 0 ? classOfDegree : 'Not Available'}
          </div>
          {cumulativeCGPA > 0 && (
            <div className="mt-1 text-xs text-amber-700">
              Based on current CGPA
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}