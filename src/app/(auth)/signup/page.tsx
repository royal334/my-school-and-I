"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

type Faculty = { id: string; name: string };
type Department = { id: string; name: string; faculty_id: string };

type SignupFormValues = {
  full_name: string;
  matric_number: string;
  level: string;
  faculty: string;
  department: string;
  email: string;
  password: string;
  faculty_id: string;
  department_id: string;
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    [],
  );
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: { level: "100", faculty: "", department: "" },
  });

  const selectedFaculty = watch("faculty");

  // Load faculties and departments once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: facs, error: facErr }, { data: depts, error: deptErr }] =
          await Promise.all([
            supabase.from("faculties").select("id, name").order("name"),
            supabase
              .from("departments")
              .select("id, name, faculty_id")
              .order("name"),
          ]);

        if (facErr) {
          toast.error("Could not load faculties: " + facErr.message);
        }

        if (deptErr) {
          toast.error("Could not load departments: " + deptErr.message);
        }

        setFaculties(facs ?? []);
        setAllDepartments(depts ?? []);
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [supabase]);

  // Filter departments whenever the selected faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      setFilteredDepartments(
        allDepartments.filter((d) => d.faculty_id === selectedFaculty),
      );
      // Reset department when faculty changes
      setValue("department", "");
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedFaculty, allDepartments, setValue]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            matric_number: data.matric_number,
            level: parseInt(data.level),
            department: data.department,
            faculty: data.faculty,
          },
        },
      });

      if (authError) throw authError;

      console.log(data.faculty, data.department)

      // 2. Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          matric_number: data.matric_number,
          level: parseInt(data.level),
          department: data.department_id,
          faculty: data.faculty_id,
        });

        if (profileError) throw profileError;
      }

      toast.success("Account created successfully", {
        position: "top-center",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Signup failed", { position: "top-center" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 flex-col space-y-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Create Account</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Join UniHub to access academic resources
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="dark:text-slate-200">
                Full Name
              </Label>
              <Input
                id="full_name"
                {...register("full_name", {
                  required: "Full name is required",
                })}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Matric Number */}
            <div className="space-y-2">
              <Label htmlFor="matric_number" className="dark:text-slate-200">
                Matric Number
              </Label>
              <Input
                id="matric_number"
                placeholder="20XXXXXXXX"
                {...register("matric_number", {
                  required: "Matric number is required",
                })}
              />
              {errors.matric_number && (
                <p className="text-sm text-red-500">
                  {errors.matric_number.message}
                </p>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level" className="dark:text-slate-200">
                Level
              </Label>
              <Controller
                name="level"
                control={control}
                rules={{ required: "Level is required" }}
                render={({ field }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        {field.value
                          ? `${field.value} Level`
                          : "Select your level"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                      <DropdownMenuRadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <DropdownMenuRadioItem value="100">
                          100 Level
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="200">
                          200 Level
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="300">
                          300 Level
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="400">
                          400 Level
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="500">
                          500 Level
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>

            {/* Faculty */}
            <div className="space-y-2">
              <Label htmlFor="faculty" className="dark:text-slate-200">
                Faculty
              </Label>
              <Controller
                name="faculty"
                control={control}
                rules={{ required: "Faculty is required" }}
                render={({ field }) => {
                  const selectedFacultyObj = faculties.find(
                    (f) => f.id === field.value,
                  );
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={loadingData}
                          className="w-full justify-between font-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        >
                          {loadingData
                            ? "Loading faculties…"
                            : selectedFacultyObj
                              ? selectedFacultyObj.name
                              : "Select your faculty"}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto">
                        <DropdownMenuRadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          {faculties.map((f) => (
                            <DropdownMenuRadioItem key={f.id} value={f.id} onSelect={() => {
                                setValue("faculty_id", f.id);
                              setValue("faculty", f.name);
                            }}>
                              {f.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
              {errors.faculty && (
                <p className="text-sm text-red-500">{errors.faculty.message}</p>
              )}
            </div>

            {/* Department — filtered by selected faculty */}
            <div className="space-y-2">
              <Label htmlFor="department" className="dark:text-slate-200">
                Department
              </Label>
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field }) => {
                  const selectedDeptObj = allDepartments.find(
                    (d) => d.id === field.value,
                  );
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!selectedFaculty || loadingData}
                          className="w-full justify-between font-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        >
                          {!selectedFaculty
                            ? "Select a faculty first"
                            : selectedDeptObj
                              ? selectedDeptObj.name
                              : "Select your department"}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto">
                        <DropdownMenuRadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          {filteredDepartments.map((d) => (
                            <DropdownMenuRadioItem key={d.id} value={d.id} onSelect={() => {
                              setValue("department_id", d.id);
                              setValue("department", d.name);
                            }}>
                              {d.name}
                            </DropdownMenuRadioItem>
                          ))}
                          {selectedFaculty &&
                            filteredDepartments.length === 0 && (
                              <DropdownMenuRadioItem value="__none__" disabled>
                                No departments found
                              </DropdownMenuRadioItem>
                            )}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
              {errors.department && (
                <p className="text-sm text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="password" className="dark:text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-2">
            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-600/50 dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
