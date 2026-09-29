import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BookOpen, Calculator, Store } from "lucide-react";
import Link from "next/link";

export function DashboardQuickActions() {
  const actions = [
    { href: "/dashboard/materials", icon: BookOpen, label: "Browse materials" },
    { href: "/dashboard/cgpa/add-semester", icon: Calculator, label: "Add semester" },
    { href: "/dashboard/market?tab=vendors", icon: Store, label: "Find vendors" },
    { href: "/dashboard/announcements", icon: Bell, label: "Announcements" },
  ];

  return (
    <Card data-tour="student-actions">
      <CardHeader>
        <h2 className="text-xl">Quick actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {actions.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <Button variant="outline" className="h-auto min-h-12 w-full justify-start px-4 py-3">
                <Icon className="h-4 w-4 text-primary-600 dark:text-primary-300" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
