"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  LEVEL_NAMES,
  SEMESTERS,
  SEMESTER_NAMES,
  MATERIAL_TYPE_LABELS,
  MAX_FILE_SIZE_MB,
} from "@/utils/constants/constants";
import { generateUniqueFileName } from "@/utils/lib";

interface Faculty {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

const SUBMISSION_TYPES = [
  "lecture_note",
  "past_question",
  "assignment",
  "lab_manual",
] as const;

const getUploadedFiles = (value: unknown): File[] => {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value);
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is File => item instanceof File);
  }

  return [];
};

const materialSubmissionSchema = z.object({
  course_code: z.string().trim().min(1, "Course code is required"),
  course_title: z.string().trim().min(1, "Course title is required"),
  faculty: z.string().min(1, "Please select a faculty"),
  department: z.string().min(1, "Please select a department"),
  level: z.string().min(1, "Please select a level"),
  semester: z.string().min(1, "Please select a semester"),
  material_type: z.string().min(1, "Please select a material type"),
  file: z
    .any()
    .refine(
      (value) => getUploadedFiles(value).length > 0,
      "Please attach a PDF file",
    )
    .refine(
      (value) => getUploadedFiles(value)[0]?.type === "application/pdf",
      "Only PDF files are allowed",
    )
    .refine(
      (value) =>
        getUploadedFiles(value)[0]?.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `File size must not exceed ${MAX_FILE_SIZE_MB}MB`,
    ),
});

type MaterialSubmissionFormValues = z.infer<typeof materialSubmissionSchema>;

export default function SubmitMaterialPage() {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialSubmissionFormValues>({
    resolver: zodResolver(materialSubmissionSchema),
    defaultValues: {
      course_code: "",
      course_title: "",
      faculty: "",
      department: "",
      level: "",
      semester: "",
      material_type: "",
    },
  });

  const facultyId = watch("faculty");
  const selectedFile = watch("file")?.[0];

  useEffect(() => {
    let cancelled = false;

    async function loadFacultiesAndDepartments() {
      try {
        const [facultyResult, departmentResult] = await Promise.all([
          supabase.from("faculties").select("id, name"),
          supabase.from("departments").select("id, name, faculty_id"),
        ]);

        if (cancelled) return;

        if (facultyResult.error) throw facultyResult.error;
        if (departmentResult.error) throw departmentResult.error;

        setFaculties(facultyResult.data || []);
        setDepartments(departmentResult.data || []);
      } catch (err) {
        console.error("Failed to load faculties/departments:", err);
      }
    }

    loadFacultiesAndDepartments();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const filteredDepartments = departments.filter(
    (department) => department.faculty_id === facultyId,
  );

  const onSubmit = async (data: MaterialSubmissionFormValues) => {
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to submit a material");
      }

      const selectedFile = data.file[0];
      const uniqueFileName = generateUniqueFileName(selectedFile.name);
      const filePath = `${session.user.id}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("material-submissions")
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("material_submissions")
        .insert({
          user_id: session.user.id,
          title: `${data.course_code} - ${data.course_title}`,
          description: `${MATERIAL_TYPE_LABELS[data.material_type] || data.material_type} - ${SEMESTER_NAMES[Number(data.semester)] || data.semester}`,
          category: data.material_type,
          faculty_id: data.faculty,
          department_id: data.department,
          level: parseInt(data.level, 10),
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          status: "pending",
        });

      if (dbError) {
        await supabase.storage
          .from("material-submissions")
          .remove([filePath]);
        throw dbError;
      }

      setSubmitted(true);
      toast.success("Material submitted for review!", {
        position: "top-center",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to submit material";
      toast.error(message, {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setValue("file", undefined as unknown as FileList, {
      shouldValidate: true,
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-md text-center py-12 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Material Submitted!</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Thank you for contributing to UniHub. Our review team will
                verify your material and add it to the platform if approved.
              </CardDescription>
            </div>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 flex-col space-y-6 py-12">
      <div className="w-full max-w-xl">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-xl dark:bg-slate-900 dark:border-slate-800 shadow-xl border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Submit a Material
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Have study materials that are not on UniHub yet? Submit them
            here for review and they could be shared with the whole community.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code</Label>
                <Input
                  id="course_code"
                  placeholder="e.g., EEE 301"
                  className="bg-slate-50 dark:bg-slate-800"
                  {...register("course_code")}
                />
                {errors.course_code && (
                  <p className="text-sm text-red-500">
                    {errors.course_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_title">Course Title</Label>
                <Input
                  id="course_title"
                  placeholder="e.g., Electrical Power Systems I"
                  className="bg-slate-50 dark:bg-slate-800"
                  {...register("course_title")}
                />
                {errors.course_title && (
                  <p className="text-sm text-red-500">
                    {errors.course_title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Faculty</Label>
                <Controller
                  name="faculty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("department", "");
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.faculty && (
                  <p className="text-sm text-red-500">{errors.faculty.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!facultyId}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                        <SelectValue
                          placeholder={facultyId ? "Select department" : "Select faculty first"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartments.map((department) => (
                          <SelectItem
                            key={department.id}
                            value={department.id}
                          >
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && (
                  <p className="text-sm text-red-500">
                    {errors.department.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVEL_NAMES).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.level && (
                  <p className="text-sm text-red-500">{errors.level.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Controller
                  name="semester"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((semester) => (
                          <SelectItem
                            key={semester}
                            value={String(semester)}
                          >
                            {SEMESTER_NAMES[semester]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.semester && (
                  <p className="text-sm text-red-500">
                    {errors.semester.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Material Type</Label>
              <Controller
                name="material_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMISSION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {MATERIAL_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.material_type && (
                <p className="text-sm text-red-500">
                  {errors.material_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">PDF Upload</Label>
              {!selectedFile ? (
                <label
                  htmlFor="file"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 ${
                    errors.file ? "border-red-500" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PDF only (MAX {MAX_FILE_SIZE_MB}MB)
                    </p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,application/pdf"
                    {...register("file")}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
                <p className="text-sm text-red-500">{errors.file.message?.toString()}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-500 dark:text-slate-500 max-w-xs">
        Your submission is sent to our review team for verification before it
        appears on the platform. Thank you for contributing to UniHub.
      </p>
    </div>
  );
}
