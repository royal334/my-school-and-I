'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePostHogAnalytics } from '@/hooks/posthog-events'
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

export default function MaterialsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = usePostHogAnalytics();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [semester, setSemester] = useState(
    searchParams.get('semester') || 'all'
  );
  const [type, setType] = useState(searchParams.get('type') || 'all');

  const handleMaterialSearch = (query: string) => {
    track(POSTHOG_EVENTS.materialSearchPerformed, {
      search_query: query,
      level,
      semester,
      type,
    });
  };

const handleSavedMaterials = () => {
  const params = new URLSearchParams(searchParams.toString());
  const isSavedActive = params.get("saved") === "true";

  if (isSavedActive) {
    params.delete("saved");
  } else {
    params.set("saved", "true");
  }

  const query = params.toString();
  router.push(`/dashboard/materials${query ? `?${query}` : ""}`);
};


  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

  if (search) {
    params.set("search", search);
  } else {
    params.delete("search");
  }

  if (level !== "all") {
    params.set("level", level);
  } else {
    params.delete("level");
  }

  if (semester !== "all") {
    params.set("semester", semester);
  } else {
    params.delete("semester");
  }

  if (type !== "all") {
    params.set("type", type);
  } else {
    params.delete("type");
  }

    const query = params.toString();
    router.push(`/dashboard/materials${query ? `?${query}` : ''}`);
  };

  // Debounced search
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      updateFilters();
      if (search.trim()) {
        handleMaterialSearch(search.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, level, semester, type]);

  const savedActive = searchParams.get("saved") === "true";
  const hasActiveFilters = search || level !== "all" || semester !== "all" || type !== "all" || savedActive;

  const clearFilters = () => {
    setSearch('');
    setLevel('all');
    setSemester('all');
    setType('all');
    const params = new URLSearchParams(searchParams.toString());
    params.set('saved', 'false')
    router.push('/dashboard/materials');
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Filter Materials</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Level Filter */}
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="100">100 Level</SelectItem>
            <SelectItem value="200">200 Level</SelectItem>
            <SelectItem value="300">300 Level</SelectItem>
            <SelectItem value="400">400 Level</SelectItem>
            <SelectItem value="500">500 Level</SelectItem>
          </SelectContent>
        </Select>

        {/* Semester Filter */}
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger>
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            <SelectItem value="1">First Semester</SelectItem>
            <SelectItem value="2">Second Semester</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lecture_note">Lecture Notes</SelectItem>
            <SelectItem value="past_question">Past Questions</SelectItem>
            <SelectItem value="textbook">Textbooks</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="lab_manual">Lab Manuals</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Bookmarked Materials*/}
        <Button variant={savedActive?"outline":"default"}
          onClick={handleSavedMaterials}
          className="flex items-center gap-2 justify-center"
        >
          <Bookmark className="h-4 w-4" />
          <span className="ml-2">Bookmarks</span>
        </Button>


      </div>
    </Card>
  );
}