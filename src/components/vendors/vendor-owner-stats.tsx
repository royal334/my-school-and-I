import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

interface VendorOwnerStatsProps {
  id: string;
  viewCount: number;
  contactCount: number;
  ratingCount: number;
  ratingAvg: number;
}

export default function VendorOwnerStats({
  id,
  viewCount,
  contactCount,
  ratingCount,
  ratingAvg,
}: VendorOwnerStatsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 font-semibold">Your Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Views</span>
            <span className="font-semibold">{viewCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Contacts</span>
            <span className="font-semibold">
              {contactCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Reviews</span>
            <span className="font-semibold">{ratingCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            <span className="font-semibold">
              {ratingAvg.toFixed(1)} ⭐
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/vendors/${id}/upgrade`}
          className="mt-4 block"
        >
          <Button className="w-full" variant="outline">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
