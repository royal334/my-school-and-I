'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
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
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { passwordStrengthSchema } from '@/lib/validations/password';
import { Checkbox } from '@/components/ui/checkbox';
import type { VendorCategory } from './category-types';
import { getVendorServiceOptions } from './category-types';

const MAX_SERVICES = 5;

const externalVendorSchema = z
  .object({
    // Business Information
    business_name: z
      .string()
      .min(3, 'Business name must be at least 3 characters')
      .max(200),
    category_id: z.string().min(1, 'Please select a category'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(2000),
    services: z.array(z.string()).min(1, 'Select at least one service'),
    phone_number: z
      .string()
      .regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number'),
    whatsapp_number: z
      .string()
      .refine(
        (value) => value === '' || /^(\+234|0)[789]\d{9}$/.test(value),
        'Invalid Nigerian phone number',
      ),
    location: z.string().max(500),
    operating_hours: z.string().max(200, 'Operating hours must be under 200 characters'),

    // Owner Information
    full_name: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(100),
    email: z.string().email('Invalid email address'),
    password: passwordStrengthSchema,
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
  categories?: VendorCategory[];
};

export default function ExternalVendorForm({
  subtitle = "Join Campus&Me's vendor marketplace and connect with thousands of students",
  showSignInLink = false,
  signInHref = '/login',
  categories = [],
}: ExternalVendorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState('');

  const form = useForm<ExternalVendorFormData>({
    resolver: zodResolver(externalVendorSchema),
    defaultValues: {
      business_name: '',
      category_id: '',
      description: '',
      services: [],
      phone_number: '',
      whatsapp_number: '',
      location: '',
      operating_hours: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const passwordValue = useWatch({
    control: form.control,
    name: 'password',
  });
  const selectedCategoryId = useWatch({
    control: form.control,
    name: 'category_id',
  });
  const selectedServices = useWatch({
    control: form.control,
    name: 'services',
  }) || [];
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const availableServices = getVendorServiceOptions(selectedCategory?.services);
  const filteredCategories = categoryQuery === ''
    ? categories
    : categories.filter((category) =>
        category.name.toLowerCase().includes(categoryQuery.toLowerCase())
      );

  const onSubmit = async (data: ExternalVendorFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/vendor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // The route returns `error`; reading `message` silently surfaced
        // "Registration failed" for every failure.
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Registration failed');
      }

      toast.success(
        'Registration successful!'
      );
      router.push('/login');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950/50">
              <Store className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <CardTitle className="text-2xl">Register Your Business</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
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
                      Business Name <span className="text-destructive">*</span>
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val !== selectedCategoryId) {
                          form.setValue('services', [], { shouldValidate: true });
                        }
                        const selected = categories.find((c) => c.id === val);
                        if (selected) setCategoryQuery(selected.name);
                      }}
                    >
                      <FormControl>
                        <ComboboxInput
                          placeholder="Select or search category"
                          value={categoryQuery}
                          onChange={(e) => {
                            setCategoryQuery(e.target.value);
                            if (field.value) {
                              field.onChange('');
                              form.setValue('services', [], { shouldValidate: true });
                            }
                          }}
                          showTrigger
                          showClear={!!categoryQuery}
                          onClear={() => {
                            setCategoryQuery('');
                            field.onChange('');
                            form.setValue('services', [], { shouldValidate: true });
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
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business and services..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Services Offered <span className="text-destructive">*</span></FormLabel>
                      {selectedCategoryId && (
                        <span className="text-xs text-muted-foreground">
                          {selectedServices.length} / {MAX_SERVICES}
                        </span>
                      )}
                    </div>
                    {!selectedCategoryId ? (
                      <p className="text-sm text-muted-foreground">
                        Select a category to see its available services.
                      </p>
                    ) : availableServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No services are configured for this category yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableServices.map((service) => {
                          const selected = selectedServices.includes(service.value);
                          const disabled = !selected && selectedServices.length >= MAX_SERVICES;
                          return (
                            <label
                              key={service.key}
                              className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              <Checkbox
                                id={`external-service-${service.key}`}
                                checked={selected}
                                disabled={disabled}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...selectedServices, service.value]
                                    : selectedServices.filter((item) => item !== service.value);
                                  form.setValue('services', next, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                              />
                              <span className="text-sm">{service.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Phone <span className="text-destructive">*</span>
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
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Location <span className="text-destructive">*</span>
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

              <FormField
                control={form.control}
                name="operating_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Hours</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mon-Fri 8AM-6PM"
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
                      Full Name <span className="text-destructive">*</span>
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
                      Email Address <span className="text-destructive">*</span>
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
                      Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        {...field}
                      />
                    </FormControl>
                    <PasswordRequirements value={passwordValue || ''} />
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
                      Confirm Password <span className="text-destructive">*</span>
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

            <p className="text-center text-xs text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>

            {showSignInLink && (
              <div>
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    Already a student?{' '}
                    <Link href='/dashboard/vendors/create' className="text-primary-600 hover:underline dark:text-primary-400">
                      Create vendor account here
                    </Link>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href={signInHref} className="text-primary-600 hover:underline dark:text-primary-400">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
