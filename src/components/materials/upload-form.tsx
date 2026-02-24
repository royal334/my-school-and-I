"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  MAX_FILE_SIZE_MB,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
} from "@/utils/constants/constants";
import axios from "axios";

interface UploadFormProps {
  courses: Array<{
    id: string;
    course_code: string;
    course_title: string;
    level: number;
    semester: number;
  }>;
}

type UploadFormValues = {
  file: FileList;
  courseId: string;
  title: string;
  type: string;
  description?: string;
  isPremium: boolean;
};

export default function UploadForm({ courses }: UploadFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    defaultValues: {
      courseId: "",
      title: "",
      type: "lecture_note",
      description: "",
      isPremium: true,
    },
  });

  const file = watch("file")?.[0];

  const onSubmit = async (data: UploadFormValues) => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", data.file[0]);
      uploadFormData.append("courseId", data.courseId);
      uploadFormData.append("title", data.title);
      uploadFormData.append("type", data.type);
      uploadFormData.append("description", data.description || "");
      uploadFormData.append("isPremium", String(data.isPremium));

     //  const response = await fetch("/api/materials/upload", {
     //    method: "POST",
     //    body: uploadFormData,
     //  });

     const response = await axios.post("/api/materials/upload", uploadFormData);



      if (response.status !== 200) {
        throw new Error(response.data.error || "Upload failed");
      }

      toast.success(response.data.message);
      router.push("/dashboard/materials");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload material");
    }
  };

  const removeFile = () => {
    reset({ file: undefined });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Upload Material</h2>
          <p className="text-sm text-slate-600">
            Upload lecture notes, past questions, and other study materials
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              PDF File <span className="text-red-500">*</span>
            </Label>
            {!file ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 ${
                    errors.file ? "border-red-500" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF only (MAX. {MAX_FILE_SIZE_MB}MB)
                    </p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    {...register("file", {
                      required: "Please select a file",
                      validate: {
                        isPdf: (files) =>
                          files[0]?.type === "application/pdf" ||
                          "Only PDF files are allowed",
                        maxSize: (files) =>
                          files[0]?.size <= MAX_FILE_SIZE_MB * 1024 * 1024 ||
                          `File size must not exceed ${MAX_FILE_SIZE_MB}MB`,
                      },
                    })}
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Thermodynamics I - Lecture Notes"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="courseId">
              Course <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="courseId"
              control={control}
              rules={{ required: "Please select a course" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_code} - {course.course_title} (
                        {course.level}L, Sem {course.semester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.courseId && (
              <p className="text-sm text-red-500">{errors.courseId.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Material Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MATERIAL_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {MATERIAL_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional information about this material..."
              {...register("description")}
              rows={3}
            />
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="premium">Premium Material</Label>
              <p className="text-sm text-slate-500">
                Require subscription to access this material
              </p>
            </div>
            <Controller
              name="isPremium"
              control={control}
              render={({ field }) => (
                <Switch
                  id="premium"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Material
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
