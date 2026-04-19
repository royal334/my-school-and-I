"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert'
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { useVendorFeatures } from "@/hooks/use-vendor-features";
import { Checkbox } from "../ui/checkbox";

const SERVICES = [
  "Printing",
  "Binding",
  "Photocopying",
  "Scanning",
  "Typing",
  "Formatting",
  "Phone Repair",
  "Computer Repair",
  "Food Service",
  "Snacks",
  "Tutoring",
  "Transport",
];

type VendorFormData = {
  business_name: string;
  category_id: string;
  description: string;
  services: string[];
  phone_number: string;
  whatsapp_number: string;
  location: string;
  operating_hours: string;
};

type VendorFormProps = {
  initialData?: Partial<VendorFormData> & { id?: string };
  mode?: "create" | "edit";
  categories?: Array<{ id: string; name: string }>;
  onSuccess?: (vendor: any) => void;
  vendor?: any;
};

// Helper component to follow Rules of Hooks
function CategorySelector({
  field,
  categories,
}: {
  field: any;
  categories?: Array<{ id: string; name: string }>;
}) {
  const [query, setQuery] = useState("");

  // Filter categories based on query
  const filteredCategories =
    query === ""
      ? categories
      : categories?.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase()),
        );

  // Sync query with selected category name on load or change
  useEffect(() => {
    if (field.value && categories) {
      const selected = categories.find((c) => c.id === field.value);
      if (selected) setQuery(selected.name);
    }
  }, [field.value, categories]);

  return (
    <Combobox
      value={field.value}
      onValueChange={(val) => {
        field.onChange(val);
        const selected = categories?.find((c) => c.id === val);
        if (selected) setQuery(selected.name);
      }}
    >
      <div className="mt-1">
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
      </div>
      <ComboboxContent>
        <ComboboxList>
          {filteredCategories?.map((category) => (
            <ComboboxItem key={category.id} value={category.id}>
              {category.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>No categories found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

export default function VendorForm({
  initialData,
  mode = "create",
  categories,
  onSuccess,
  vendor,
}: VendorFormProps) {
  const router = useRouter();
  const features = vendor ? useVendorFeatures(vendor) : null;
  const maxServices = features?.maxServices || 5;
  const isUnlimited = features?.canHaveUnlimitedServices || false;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    defaultValues: {
      business_name: initialData?.business_name ?? "",
      category_id: initialData?.category_id ?? "",
      description: initialData?.description ?? "",
      services: initialData?.services ?? [],
      phone_number: initialData?.phone_number ?? "",
      whatsapp_number: initialData?.whatsapp_number ?? "",
      location: initialData?.location ?? "",
      operating_hours: initialData?.operating_hours ?? "",
    },
  });

  const selectedServices = watch("services");
  const description = watch("description");

  const toggleService = (service: string) => {
    const current = selectedServices ?? [];
    setValue(
      "services",
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service],
      { shouldValidate: true },
    );
  };


  const onSubmit = async (data: VendorFormData) => {
    try {
      const isEdit = mode === "edit" && initialData?.id;
      const url = isEdit
        ? `/api/vendors/${initialData!.id}`
        : "/api/vendors/create";
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            (isEdit ? "Failed to update vendor" : "Failed to create vendor"),
        );
      }

      if(selectedServices.length > maxServices){
        toast.error(isEdit ? "Failed to update vendor" : "Failed to create vendor")
        throw new Error(isEdit ? "Failed to update vendor" : "Failed to create vendor")
      }

      const { vendor } = await response.json();
      toast.success(
        isEdit
          ? "Vendor listing updated!"
          : "Vendor listing created! Pending admin approval.",
      );
      
      if (onSuccess) {
        onSuccess(vendor);
      } else {
        router.push(`/dashboard/vendors/${vendor.id}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Name */}
      <div>
        <label className="text-sm font-medium">Business Name *</label>
        <Input
          {...register("business_name", {
            required: "Business name is required",
            minLength: { value: 3, message: "Must be at least 3 characters" },
          })}
          placeholder="e.g., Tech Print Solutions"
        />
        {errors.business_name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.business_name.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium">Category *</label>
        <Controller
          name="category_id"
          control={control}
          rules={{ required: "Please select a category" }}
          render={({ field }) => (
            <CategorySelector field={field} categories={categories} />
          )}
        />
        {errors.category_id && (
          <p className="mt-1 text-xs text-red-500">
            {errors.category_id.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium">Description *</label>
        <Textarea
          {...register("description", {
            required: "Description is required",
            minLength: { value: 20, message: "Must be at least 20 characters" },
          })}
          placeholder="Describe your business and services..."
          rows={4}
        />
        <p className="mt-1 text-xs text-slate-500">
          {description?.length ?? 0}/20 minimum
        </p>
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Services Multi-select */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Services Offered *</label>
          <div className="flex items-center gap-2">
          <Badge variant={selectedServices.length >= maxServices ? 'destructive' : 'default'}>
            {selectedServices.length} / {isUnlimited ? '∞' : maxServices}
          </Badge>
          {vendor && features && (
          <Badge variant="outline" className="text-xs">
          {features.tier}
          </Badge>
      )}
          </div>
        </div>

          {/* ADD THIS: Warning when at/near limit */}
  {selectedServices.length >= maxServices && !isUnlimited && (
    <Alert variant="destructive" className="border-amber-300 bg-amber-50 mt-3">
      <CircleAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Service Limit Reached</AlertTitle>
      <AlertDescription className="text-amber-800">
        You've reached your limit of {maxServices} services.
        {features?.tier === 'basic' && (
          <>
            {' '}
            <Link 
              href={`/dashboard/vendors/${vendor?.id}/upgrade?tier=premium`}
              className="font-medium underline"
            >
              Upgrade to Premium
            </Link>
            {' '}for 15 services.
          </>
        )}
        {features?.tier === 'premium' && (
          <>
            {' '}
            <Link 
              href={`/dashboard/vendors/${vendor?.id}/upgrade?tier=featured`}
              className="font-medium underline"
            >
              Upgrade to Featured
            </Link>
            {' '}for unlimited services.
          </>
        )}
      </AlertDescription>
    </Alert>
  )}

        {/* Hidden input so RHF tracks & validates */}
        <input
          type="hidden"
          {...register("services", {
            validate: (v) =>
              v.length > 0 || "Please select at least one service",
          })}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service);
            const isDisabled = !isSelected && selectedServices.length >= maxServices && !isUnlimited;
            
            return (
              <label 
                key={service} 
                className={`flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <Checkbox
                  id={`service-${service}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleService(service)}
                  disabled={isDisabled}
                />
                <span className="text-sm font-normal">{service}</span>
              </label>
            );
          })}
        </div>
        {errors.services && (
          <p className="mt-1 text-xs text-red-500">{errors.services.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="text-sm font-medium">Phone Number *</label>
        <Input
          type="tel"
          {...register("phone_number", {
            required: "Phone number is required",
            pattern: {
              value: /^(\+234|0)[789]\d{9}$/,
              message: "Invalid Nigerian phone number",
            },
          })}
          placeholder="e.g., 08012345678"
        />
        {errors.phone_number && (
          <p className="mt-1 text-xs text-red-500">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      {/* WhatsApp Number */}
      <div>
        <label className="text-sm font-medium">WhatsApp Number</label>
        <Input
          type="tel"
          {...register("whatsapp_number", {
            pattern: {
              value: /^(\+234|0)[789]\d{9}$/,
              message: "Invalid Nigerian phone number",
            },
          })}
          placeholder="e.g., 08012345678"
        />
        {errors.whatsapp_number && (
          <p className="mt-1 text-xs text-red-500">
            {errors.whatsapp_number.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium">Location</label>
        <Input {...register("location")} placeholder="e.g., Near Main Gate" />
      </div>

      {/* Operating Hours */}
      <div>
        <label className="text-sm font-medium">Operating Hours</label>
        <Input
          {...register("operating_hours")}
          placeholder="e.g., Mon-Fri 8AM-6PM"
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? mode === "edit"
            ? "Saving..."
            : "Creating..."
          : mode === "edit"
            ? "Save Changes"
            : "Create Vendor Listing"}
      </Button>
    </form>
  );
}
