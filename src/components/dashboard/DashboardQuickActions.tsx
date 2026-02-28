import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BookOpen, Calculator, Store } from 'lucide-react';
import Link from 'next/link';

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Quick Actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/materials">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Materials
            </Button>
          </Link>
          <Link href="/dashboard/cgpa/add-semester">
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </Link>
          <Link href="/dashboard/vendors">
            <Button variant="outline" className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              Find Vendors
            </Button>
          </Link>
          <Link href="/dashboard/announcements">
            <Button variant="outline" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Announcements
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

