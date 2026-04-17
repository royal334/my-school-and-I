import { Card, CardContent } from '@/components/ui/card';
import UpgradeButton from '../payment/update-button';



export function DashboardSubscriptionBanner() {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/30 transition-all">
      <CardContent className="flex flex-col items-start md:flex-row md:items-center justify-between py-4">
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-400">Upgrade to Premium</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300/80">
            Get unlimited access to all materials for just ₦1000/semester
          </p>
        </div>
        <UpgradeButton className='bg-amber-600 hover:bg-amber-700 mt-4 md:mt-0' />
      </CardContent>
    </Card>
  );
}

