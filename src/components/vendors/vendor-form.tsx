"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

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
};

export default function VendorForm({
  initialData,
  mode = "create",
  categories,
}: VendorFormProps) {
  const router = useRouter();

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
        ? `/api/vendors/${initialData!.id}/update`
        : "/api/vendors/create";
      const response = await fetch(url, {
        method: "POST",
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

      const { vendor } = await response.json();
      toast.success(
        isEdit
          ? "Vendor listing updated!"
          : "Vendor listing created! Pending admin approval.",
      );
      router.push(`/dashboard/vendors/${vendor.id}`);
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
          render={({ field }) => {
            const selected = categories?.find((c) => c.id === field.value);
            return (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="border-input mt-1 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className={selected ? "" : "text-muted-foreground"}>
                      {selected ? selected.name : "Select category"}
                    </span>
                    <ChevronDown className="size-4 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-48">
                  {categories?.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onSelect={() => field.onChange(category.id)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
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
        <label className="text-sm font-medium">Services Offered *</label>
        {/* Hidden input so RHF tracks & validates */}
        <input
          type="hidden"
          {...register("services", {
            validate: (v) =>
              v.length > 0 || "Please select at least one service",
          })}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SERVICES.map((service) => (
            <label key={service} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedServices?.includes(service) ?? false}
                onChange={() => toggleService(service)}
              />
              <span className="text-sm">{service}</span>
            </label>
          ))}
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
