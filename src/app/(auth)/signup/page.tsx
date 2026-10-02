"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ChevronDown, Eye, EyeOff } from "lucide-react";
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
import { signupFormSchema, type SignupFormValues } from "@/lib/validations/signup";

type Faculty = { id: string; name: string };
type Department = { id: string; name: string; faculty_id: string };

export default function SignupPage() {
  const router = useRouter();

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    [],
  );
  const [loadingData, setLoadingData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
defaultValues: {
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        level: "100",
        faculty: "",
        department: "",
        faculty_id: "",
        department_id: "",
        phone_number: "",
        matric_number: "",
        is_new_student: false,
      },
  });

  const selectedFaculty = watch("faculty_id");
  const isNewStudent = watch("is_new_student");

  // Load faculties and departments once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/reference");
        if (!response.ok) throw new Error("Failed to load faculties/departments");
        const data = await response.json();

        setFaculties(data.faculties ?? []);
        setAllDepartments(data.departments ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load faculties";
        toast.error("Could not load faculties: " + message);
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // Filter departments whenever the selected faculty changes
  useEffect(() => {
    if (selectedFaculty) {
      setFilteredDepartments(
        allDepartments.filter((d) => d.faculty_id === selectedFaculty),
      );
      // Reset department when faculty changes
      setValue("department", "");
      setValue("department_id", "");
    } else {
      setFilteredDepartments([]);
      setValue("department", "");
      setValue("department_id", "");
    }
  }, [selectedFaculty, allDepartments, setValue]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Signup and the profiles insert both happen server-side. A client-side
      // profiles write cannot succeed here: with email confirmation enabled the
      // new user has no session, so RLS rejects it.
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Signup failed");
      }

      toast.success(
        result?.requiresEmailConfirmation
          ? "Account created successfully. Please check your email to confirm your account before signing in."
          : "Account created successfully",
        { position: "top-center" },
      );
      router.replace("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Signup failed";
      toast.error(message, { position: "top-center" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark:bg-background flex-col space-y-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground p-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md dark:bg-card dark:border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Create Account</CardTitle>
          <CardDescription className="dark:text-muted-foreground">
            Join Campus&Me to access academic resources
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="dark:text-foreground">
                Full Name
              </Label>
              <Input
                id="full_name"
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="dark:text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                placeholder="070XXXXXXXX"
                {...register("phone_number")}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Matric Number */}
            {!isNewStudent && (
              <div className="space-y-2">
                <Label htmlFor="matric_number" className="dark:text-foreground">
                  Matric/Reg Number
                </Label>
                <Input
                  id="matric_number"
                  placeholder="20XXXXXXXX"
                  {...register("matric_number")}
                />
                {errors.matric_number && (
                  <p className="text-sm text-destructive">
                    {errors.matric_number.message}
                  </p>
                )}
              </div>
            )}

            {/* New student — matric number not yet issued */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <Controller
                name="is_new_student"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_new_student"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) setValue("matric_number", "");
                      clearErrors("matric_number");
                    }}
                    className="mt-0.5"
                  />
                )}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="is_new_student"
                  className="cursor-pointer text-sm font-medium"
                >
                  I&apos;m a new student
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isNewStudent
                    ? "No problem — we’ll leave the matric number empty. Add it later from your profile once it is issued."
                    : "No matric number yet? Switch this on and we’ll skip the field for now."}
                </p>
              </div>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level" className="dark:text-foreground">
                Level
              </Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal dark:bg-muted dark:border-border dark:text-foreground"
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
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>

            {/* Faculty */}
            <div className="space-y-2">
              <Label htmlFor="faculty" className="dark:text-foreground">
                Faculty
              </Label>
              <Controller
                name="faculty_id"
                control={control}
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
                          className="w-full justify-between font-normal dark:bg-muted dark:border-border dark:text-foreground"
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("faculty", "");
                            setValue("department", "");
                            setValue("department_id", "");
                          }}
                        >
                          {faculties.map((f) => (
                            <DropdownMenuRadioItem
                              key={f.id}
                              value={f.id}
                              onSelect={() => {
                                setValue("faculty_id", f.id);
                                setValue("faculty", f.name);
                              }}
                            >
                              {f.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
              {errors.faculty_id && (
                <p className="text-sm text-destructive">{errors.faculty_id.message}</p>
              )}
            </div>

            {/* Department — filtered by selected faculty */}
            <div className="space-y-2">
              <Label htmlFor="department" className="dark:text-foreground">
                Department
              </Label>
              <Controller
                name="department_id"
                control={control}
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
                          className="w-full justify-between font-normal dark:bg-muted dark:border-border dark:text-foreground"
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("department", "");
                          }}
                        >
                          {filteredDepartments.map((d) => (
                            <DropdownMenuRadioItem
                              key={d.id}
                              value={d.id}
                              onSelect={() => {
                                setValue("department_id", d.id);
                                setValue("department", d.name);
                              }}
                            >
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
              {errors.department_id && (
                <p className="text-sm text-destructive">
                  {errors.department_id.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="confirm_password" className="dark:text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pr-10"
                  {...register("confirm_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
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
