'use client';

import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotificationType } from './types';

interface NotificationFiltersProps {
  type: NotificationType;
  searchQuery: string;
  onTypeChange: (type: NotificationType) => void;
  onSearchChange: (query: string) => void;
}

export default function NotificationFilters({
  type,
  searchQuery,
  onTypeChange,
  onSearchChange,
}: NotificationFiltersProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
