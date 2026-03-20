'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sliders } from 'lucide-react';
import { toast } from 'sonner';

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    language: 'en',
    dateFormat: 'dd/mm/yyyy',
    materialsView: 'grid',
    materialsPerPage: '12',
  });

  const handleChange = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    toast.success('Preference updated');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Preferences</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Customize your UniHub experience
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => handleChange('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="yo">Yoruba</SelectItem>
                <SelectItem value="ig">Igbo</SelectItem>
                <SelectItem value="ha">Hausa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) => handleChange('dateFormat', value)}
            >
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materials View */}
          <div className="space-y-2">
            <Label htmlFor="materials-view">Materials View</Label>
            <Select
              value={preferences.materialsView}
              onValueChange={(value) => handleChange('materialsView', value)}
            >
              <SelectTrigger id="materials-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="compact">Compact View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materials Per Page */}
          <div className="space-y-2">
            <Label htmlFor="materials-per-page">Materials Per Page</Label>
            <Select
              value={preferences.materialsPerPage}
              onValueChange={(value) => handleChange('materialsPerPage', value)}
            >
              <SelectTrigger id="materials-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 materials</SelectItem>
                <SelectItem value="12">12 materials</SelectItem>
                <SelectItem value="24">24 materials</SelectItem>
                <SelectItem value="48">48 materials</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}