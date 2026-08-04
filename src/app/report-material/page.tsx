"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, Flag } from "lucide-react";
import Link from "next/link";

const REPORT_REASONS = [
  { value: "incomplete", label: "Incomplete material" },
  { value: "outdated", label: "Outdated content" },
  { value: "incorrect", label: "Incorrect information" },
  { value: "wrong_file", label: "Wrong file / mismatch" },
  { value: "duplicate", label: "Duplicate material" },
  { value: "copyright", label: "Copyright violation" },
  { value: "offensive", label: "Offensive / inappropriate" },
  { value: "other", label: "Other" },
];

function ReportMaterialContent() {
  const searchParams = useSearchParams();
  const materialId = searchParams.get("materialId") || "";
  const materialTitle = searchParams.get("title") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason for the report", {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    data.reason = reason;
    data.material_id = materialId;
    data.access_key = process.env.NEXT_PUBLIC_WEB3FORMS_ID || "";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        toast.success("Thank you for your report!", {
          position: "top-center",
        });
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to send report";
      toast.error(message, {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
      clearTimeout(timeoutId);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-md text-center py-12 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Flag className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Report Received!</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Thank you for helping us keep the material library accurate. Our
                team will review this material shortly.
              </CardDescription>
            </div>
            <Link href="/dashboard/materials" className="inline-block mt-4">
              <Button>Back to Materials</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 flex-col space-y-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/dashboard/materials">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Materials
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800 shadow-xl border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Report a Material
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Let us know if a material is incomplete, outdated, incorrect, or
            problematic
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {materialTitle && (
              <div className="space-y-2">
                <Label htmlFor="material_title">Material</Label>
                <Input
                  id="material_title"
                  name="material_title"
                  value={materialTitle}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Report</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger
                  id="reason"
                  className="bg-slate-50 dark:bg-slate-800"
                >
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the issue with this material in detail..."
                required
                className="min-h-[150px] bg-slate-50 dark:bg-slate-800 resize-none"
              />
            </div>

            {/* Anti-spam/bot honeypot */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: "none" }}
            />
            {materialId && (
              <input type="hidden" name="material_id" value={materialId} />
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full text-white font-semibold transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-500 dark:text-slate-500 max-w-xs">
        Your report is directly sent to our management team for review. Thank
        you for keeping UniHub&apos;s materials reliable.
      </p>
    </div>
  );
}

export default function ReportMaterialPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="pt-6 text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Loading...
              </h2>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ReportMaterialContent />
    </Suspense>
  );
}
