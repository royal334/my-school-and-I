import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BookOpen, Calculator, Store } from 'lucide-react';
import Link from 'next/link';

export function DashboardQuickActions() {
  return (
    <Card data-tour="student-actions">
      <CardHeader>
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>Quick actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/materials">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse materials
            </Button>
          </Link>
          <Link href="/dashboard/cgpa/add-semester">
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="mr-2 h-4 w-4" />
              Add semester
            </Button>
          </Link>
          <Link href="/dashboard/vendors">
            <Button variant="outline" className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              Find vendors
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
