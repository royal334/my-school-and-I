'use client';

import Link from "next/link";
import { EllipsisVertical, Flag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface VendorReportMenuProps {
  vendorId: string;
  businessName: string;
}

export default function VendorReportMenu({
  vendorId,
  businessName,
}: VendorReportMenuProps) {
  const href = `/report-vendor?vendorId=${encodeURIComponent(vendorId)}&name=${encodeURIComponent(businessName)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Vendor actions"
        >
          <EllipsisVertical className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <Link href={href}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 font-normal"
          >
            <Flag className="h-4 w-4" />
            Report this vendor
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
