import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, BarChart3 } from "lucide-react";

interface VendorHeaderProps {
  id: string;
  isOwner: boolean;
}

export default function VendorHeader({ id, isOwner }: VendorHeaderProps) {
  return (
    <div className="flex items-center justify-between mt-2">
      <Link href="/dashboard/vendors">
        <Button variant="ghost" size="sm">
          ← Back to Vendors
        </Button>
      </Link>

      {isOwner && (
        <div className="flex gap-2">
          <Link href={`/dashboard/vendors/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/vendors/${id}/analytics`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
