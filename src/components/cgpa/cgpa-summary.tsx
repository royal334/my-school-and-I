"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, Award, BookOpen } from "lucide-react";
import { getClassOfDegree } from "@/utils/lib/cgpa-helpers";

import { CGPASummaryProps } from "@/utils/types";

export default function CGPASummary({
  currentSemesterGPA,
  cumulativeCGPA,
  totalCreditUnits,
}: CGPASummaryProps) {
  const classOfDegree = getClassOfDegree(cumulativeCGPA);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Current Semester GPA */}
      <Card className="border-[#A8D8C2] bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.1)] dark:border-[rgba(126,200,160,0.2)] transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3A7260] dark:text-[#7EC8A0]">
              Current semester GPA
            </span>
            <TrendingUp className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          </div>
        </CardHeader>
        <CardContent>
          {currentSemesterGPA !== null ? (
            <div className="text-3xl font-bold text-[#1A3C34] dark:text-[#E8F5EF]">
              {currentSemesterGPA.toFixed(2)}
              <span className="text-base font-normal text-[#4A8C73] dark:text-[#7EC8A0]">
                {" "}
                / 5.0
              </span>
            </div>
          ) : (
            <div className="text-sm text-[#4A8C73] dark:text-[#7EC8A0]">
              No semester added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cumulative CGPA */}
      <Card className="border-[#A8D8C2] bg-[#E8F5EF] dark:bg-[rgba(126,200,160,0.1)] dark:border-[rgba(126,200,160,0.2)] transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3A7260] dark:text-[#7EC8A0]">
              Cumulative CGPA
            </span>
            <Award className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#1A3C34] dark:text-[#E8F5EF]">
            {cumulativeCGPA.toFixed(2)}
            <span className="text-base font-normal text-[#4A8C73] dark:text-[#7EC8A0]">
              {" "}
              / 5.0
            </span>
          </div>
          <div className="mt-1 text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
            {totalCreditUnits} total credit units
          </div>
        </CardContent>
      </Card>

      {/* Class of Degree */}
      <Card className="border-[#D6E5DF] bg-white dark:bg-[#1A2822] dark:border-[rgba(126,200,160,0.15)] transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7B75] dark:text-[#A8C8BB]">
              Class of degree
            </span>
            <BookOpen className="h-5 w-5 text-[#E8A020] dark:text-[#E8A020]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#141F1B] dark:text-[#E8F5EF]">
            {cumulativeCGPA > 0 ? classOfDegree : "Not available"}
          </div>
          {cumulativeCGPA > 0 && (
            <div className="mt-1 text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
              Based on current CGPA
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
