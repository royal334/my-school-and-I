'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light theme',
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme',
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Follow system preference',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize how CampusHub looks on your device
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select your preferred theme or use system default
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;

            return (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-muted ${
                  isActive
                    ? 'border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-950'
                    : 'border-border'
                }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-400">
                    <svg
                      className="h-3 w-3 text-white dark:text-primary-950"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                <Icon
                  className={`h-8 w-8 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-muted-foreground'
                  }`}
                />
                <div className="text-center">
                  <p
                    className={`font-medium ${
                      isActive
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-foreground'
                    }`}
                  >
                    {themeOption.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}