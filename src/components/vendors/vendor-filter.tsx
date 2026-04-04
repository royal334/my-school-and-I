"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface VendorFiltersProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export default function VendorFilters({ categories }: VendorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const updateFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const queryString = params.toString();
    router.push(`/dashboard/vendors${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    router.push("/dashboard/vendors");
  };

  const hasActiveFilters = search || selectedCategory !== "all";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Category Chips */}
      <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedCategory("all")}
        >
          🏪 All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon} {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
