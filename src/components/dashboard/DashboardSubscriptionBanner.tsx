import { Card, CardContent } from '@/components/ui/card';
import UpgradeButton from '../payment/update-button';

export function DashboardSubscriptionBanner() {
  return (
    <Card className="border-[#D6E5DF] bg-[#FFF0D4] dark:bg-[rgba(232,160,32,0.1)] dark:border-[rgba(232,160,32,0.3)] transition-all">
      <CardContent className="flex flex-col items-start md:flex-row md:items-center justify-between py-4">
        <div>
          <h3 className="font-medium text-[#3A2800] dark:text-[#E8A020]">Upgrade to premium</h3>
          <p className="text-sm text-[#9E6A08] dark:text-[#FFD07A]/80">
            Get unlimited access to all materials for just ₦1000/semester
          </p>
        </div>
        <UpgradeButton className='bg-[#E8A020] hover:bg-[#C4850A] text-[#3A2800] mt-4 md:mt-0' />
      </CardContent>
    </Card>
  );
}
