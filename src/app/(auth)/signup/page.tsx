"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

type SignupFormValues = {
  full_name: string;
  matric_number: string;
  level: string;
  department: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: { level: "100", department: "" },
  });

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
          },
        },
      });

      if (authError) throw authError;

      // 2. Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          matric_number: data.matric_number,
          level: parseInt(data.level),
          department: data.department,
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Create Account</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Join UniHub to access academic resources
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="dark:text-slate-200">Full Name</Label>
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
            <div className="space-y-2">
              <Label htmlFor="matric_number" className="dark:text-slate-200">Matric Number</Label>
              <Input
                id="matric_number"
                placeholder="ENG/2024/001"
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
            <div className="space-y-2">
              <Label htmlFor="level" className="dark:text-slate-200">Level</Label>
              <Controller
                name="level"
                control={control}
                rules={{ required: "Level is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="dark:text-slate-200">Department</Label>
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Civil Engineering">
                        Civil Engineering
                      </SelectItem>
                      <SelectItem value="Electrical Engineering">
                        Electrical Engineering
                      </SelectItem>
                      <SelectItem value="Petroleum Engineering">
                        Petroleum Engineering
                      </SelectItem>
                      <SelectItem value="Industrial and Production Engineering">
                        Industrial and Production Engineering
                      </SelectItem>
                      <SelectItem value="Mechanical Engineering">
                        Mechanical Engineering
                      </SelectItem>
                      <SelectItem value="Computer Engineering">
                        Computer Engineering
                      </SelectItem>
                      <SelectItem value="Material and Metallurgical Engineering">
                        Material and Metallurgical Engineering
                      </SelectItem>
                      <SelectItem value="Agricultural and Bioresource Engineering">
                        Agricultural and Bioresource Engineering
                      </SelectItem>
                      <SelectItem value="Chemical Engineering">
                        Chemical Engineering
                      </SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-200">Email</Label>
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
            <div className="space-y-2 mb-4">
              <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
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
              <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
