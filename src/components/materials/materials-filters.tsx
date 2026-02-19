'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { debounce } from '@/utils/lib/index';

export default function MaterialsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [semester, setSemester] = useState(
    searchParams.get('semester') || 'all'
  );
  const [type, setType] = useState(searchParams.get('type') || 'all');

  // Debounced search
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      updateFilters();
    }, 500);

    debouncedUpdate();
  }, [search, level, semester, type]);

  const updateFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (level !== 'all') params.set('level', level);
    if (semester !== 'all') params.set('semester', semester);
    if (type !== 'all') params.set('type', type);

    const query = params.toString();
    router.push(`/dashboard/materials${query ? `?${query}` : ''}`);
  };

  const clearFilters = () => {
    setSearch('');
    setLevel('all');
    setSemester('all');
    setType('all');
    router.push('/dashboard/materials');
  };

  const hasActiveFilters =
    search || level !== 'all' || semester !== 'all' || type !== 'all';

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-slate-600" />
        <h2 className="font-semibold text-slate-900">Filter Materials</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
      </div>
    </Card>
  );
}