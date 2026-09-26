import { Card, CardContent } from "@/components/ui/card";
import UpgradeButton from "../payment/update-button";

export function DashboardSubscriptionBanner() {
  return (
    <Card className="border-accent-200 bg-accent-50/60 dark:border-accent-900 dark:bg-accent-950/25">
      <CardContent className="flex flex-col items-start justify-between py-4 md:flex-row md:items-center">
        <div>
          <h3 className="font-semibold text-accent-900 dark:text-accent-200">Upgrade to premium</h3>
          <p className="text-sm text-accent-800/80 dark:text-accent-300/80">
            Get unlimited access to all materials for just ₦1000/semester.
          </p>
        </div>
        <UpgradeButton className="mt-4 bg-accent-500 text-accent-950 hover:bg-accent-400 md:mt-0" />
      </CardContent>
    </Card>
  );
}
