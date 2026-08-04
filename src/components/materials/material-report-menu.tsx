'use client';

import Link from "next/link";
import { EllipsisVertical, Flag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MaterialReportMenuProps {
  materialId: string;
  materialTitle: string;
}

export default function MaterialReportMenu({
  materialId,
  materialTitle,
}: MaterialReportMenuProps) {
  const href = `/report-material?materialId=${encodeURIComponent(materialId)}&title=${encodeURIComponent(materialTitle)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Material actions"
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
            Report this material
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
