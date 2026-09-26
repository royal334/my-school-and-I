"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, SlidersHorizontal, Check } from "lucide-react";
import { usePostHogAnalytics } from "@/hooks/posthog-events";
import { POSTHOG_EVENTS } from "@/utils/constants/constants";

interface VendorFiltersProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export default function VendorFilters({ categories }: VendorFiltersProps) {
  return (
    <Suspense fallback={null}>
      <VendorFiltersContent categories={categories} />
    </Suspense>
  );
}

function VendorFiltersContent({ categories }: VendorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = usePostHogAnalytics();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [open, setOpen] = useState(false);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const queryString = params.toString();
    router.push(`/dashboard/vendors${queryString ? `?${queryString}` : ""}`);
  }, [router, search, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
      if (search.trim()) {
        track(POSTHOG_EVENTS.vendorSearchPerformed, {
          search_query: search.trim(),
          category: selectedCategory,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, track, updateFilters]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    router.push("/dashboard/vendors");
  };

  const hasActiveFilters = search || selectedCategory !== "all";
  const activeCategoryName =
    selectedCategory !== "all"
      ? categories.find((c) => c.id === selectedCategory)
      : null;

  return (
    <div className="space-y-3">
      {/* Search Bar + Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-border"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className={`shrink-0 border-border ${
                selectedCategory !== "all"
                  ? "bg-primary-50 dark:bg-muted text-primary-700 dark:text-primary-300 border-primary-600 dark:border-primary-400"
                  : "text-muted-foreground hover:bg-muted dark:hover:bg-accent"
              }`}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {selectedCategory !== "all" && (
                <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-64 p-2 border-border"
          >
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary-50 dark:bg-muted text-primary-700 dark:text-primary-300 font-medium"
                    : "text-muted-foreground hover:bg-muted dark:hover:bg-accent"
                }`}
              >
                <span className="flex-1 text-left">All categories</span>
                {selectedCategory === "all" && (
                  <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    selectedCategory === category.id
                    ? "bg-primary-50 dark:bg-muted text-primary-700 dark:text-primary-300 font-medium"
                    : "text-muted-foreground hover:bg-muted dark:hover:bg-accent"
                }`}
              >
                <span className="text-base">{category.icon}</span>
                  <span className="flex-1 text-left">{category.name}</span>
                  {selectedCategory === category.id && (
                    <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-accent"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter indicator */}
      {activeCategoryName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
            {activeCategoryName.icon} {activeCategoryName.name}
            <button
              onClick={() => setSelectedCategory("all")}
              className="ml-0.5 rounded-full hover:bg-border p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}