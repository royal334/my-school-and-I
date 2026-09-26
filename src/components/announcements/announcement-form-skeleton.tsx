import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnnouncementFormSkeleton() {
     return(
          <div className="mx-auto max-w-4xl space-y-6">
          <Card>
          <CardHeader>
               <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-6">
               <div className="space-y-2">
               <div className="h-4 w-24 animate-pulse rounded bg-muted" />
               <div className="h-10 animate-pulse rounded bg-muted" />
               </div>
               <div className="space-y-2">
               <div className="h-4 w-24 animate-pulse rounded bg-muted" />
               <div className="h-32 animate-pulse rounded bg-muted" />
               </div>
               <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-10 animate-pulse rounded bg-muted" />
               </div>
               <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-10 animate-pulse rounded bg-muted" />
               </div>
               </div>
               <div className="space-y-2">
               <div className="h-4 w-28 animate-pulse rounded bg-muted" />
               <div className="h-10 animate-pulse rounded bg-muted" />
               </div>
               <div className="flex gap-3">
               <div className="h-10 w-24 animate-pulse rounded bg-muted" />
               <div className="h-10 w-32 animate-pulse rounded bg-muted" />
               </div>
          </CardContent>
          </Card>
          </div>
     )
}