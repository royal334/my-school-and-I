'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { toast } from 'sonner';
import { Loader2, Store } from 'lucide-react';
import Link from 'next/link';

const externalVendorSchema = z
  .object({
    // Business Information
    business_name: z
      .string()
      .min(3, 'Business name must be at least 3 characters')
      .max(200),
    category_id: z.string().min(1, 'Please select a category'),
    business_phone: z
      .string()
      .regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number'),
    business_address: z
      .string()
      .min(10, 'Please provide a complete address')
      .max(500),

    // Owner Information
    full_name: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ExternalVendorFormData = z.infer<typeof externalVendorSchema>;

type ExternalVendorFormProps = {
  subtitle?: string;
  showSignInLink?: boolean;
  signInHref?: string;
  categories?: Array<{ id: string; name: string }>;
};

export default function ExternalVendorForm({
  subtitle = "Join UniHub's vendor marketplace and connect with thousands of students",
  showSignInLink = false,
  signInHref = '/login',
  categories = [],
}: ExternalVendorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ExternalVendorFormData>({
    resolver: zodResolver(externalVendorSchema),
    defaultValues: {
      business_name: '',
      category_id: '',
      business_phone: '',
      business_address: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ExternalVendorFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/vendor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast.success(
        'Registration successful!'
      );
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Store className="h-8 w-8 text-primary-600" />
            </div>
            <CardTitle className="text-2xl">Register Your Business</CardTitle>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>

              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Name <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Best Print Shop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => {
                  const [query, setQuery] = useState("");
                  
                  const filteredCategories = query === "" 
                    ? categories 
                    : categories.filter((c) => 
                        c.name.toLowerCase().includes(query.toLowerCase())
                      );

                  useEffect(() => {
                    if (field.value && categories.length > 0) {
                      const selected = categories.find(c => c.id === field.value);
                      if (selected) setQuery(selected.name);
                    }
                  }, [field.value, categories]);

                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Category <span className="text-red-600">*</span>
                      </FormLabel>
                      <Combobox
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          const selected = categories.find(c => c.id === val);
                          if (selected) setQuery(selected.name);
                        }}
                      >
                        <FormControl>
                          <ComboboxInput
                            placeholder="Select or search category"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            showTrigger
                            showClear={!!query}
                            onClear={() => {
                              setQuery("");
                              field.onChange("");
                            }}
                          />
                        </FormControl>
                        <ComboboxContent>
                          <ComboboxList>
                            {filteredCategories.map((category) => (
                              <ComboboxItem key={category.id} value={category.id}>
                                {category.name}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                          <ComboboxEmpty>No categories found</ComboboxEmpty>
                        </ComboboxContent>
                      </Combobox>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="business_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Phone <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g., 08012345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Address <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full business address"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Owner Information</h3>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimum 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Re-enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Vendor Account'
              )}
            </Button>

            <p className="text-center text-xs text-slate-600">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>

            {showSignInLink && (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link href={signInHref} className="text-primary-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
