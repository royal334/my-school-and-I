'use client';

import Link from "next/link";
import { EllipsisVertical, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function MaterialsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Materials menu">
          <EllipsisVertical className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <Link href="/submit-material">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 font-normal"
          >
            <Upload className="h-4 w-4" />
            Submit material for review
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
