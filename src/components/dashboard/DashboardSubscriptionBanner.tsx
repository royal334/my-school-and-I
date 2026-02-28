import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardSubscriptionBanner() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <h3 className="font-semibold text-amber-900">Upgrade to Premium</h3>
          <p className="text-sm text-amber-700">
            Get unlimited access to all materials for just ₦400/semester
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700">
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
}

