# Week 1 Implementation Guide
## Engineering Department Platform - Step-by-Step Build Plan

This guide provides detailed, day-by-day instructions for building the platform in 7 days.

---

## Pre-Development Checklist

### Required Accounts & Tools
- [ ] GitHub account (version control)
- [ ] Supabase account (database & auth)
- [ ] Vercel account (hosting)
- [ ] Paystack account (payments)
- [ ] Code editor (VS Code recommended)
- [ ] Node.js v18+ installed
- [ ] Git installed

### Initial Setup (30 minutes)
```bash
# Create project directory
npx create-next-app@latest engiportal --typescript --tailwind --app

# Navigate to project
cd engiportal

# Install additional dependencies
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install @radix-ui/react-* lucide-react clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
npm install zustand @tanstack/react-query
npm install react-pdf pdf-lib

# Install shadcn/ui
npx shadcn-ui@latest init

# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin your-github-repo-url
git push -u origin main
```

---

## DAY 1: Foundation & Database Setup

### Morning Session (9 AM - 12 PM): Project Configuration

#### 1. Setup Supabase Project (30 min)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in details:
   - Name: engiportal
   - Database Password: Generate strong password
   - Region: Choose closest to Nigeria (e.g., eu-west)
4. Wait for project to provision (~2 minutes)
5. Copy project URL and anon key from Settings > API

#### 2. Configure Environment Variables (15 min)
Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3. Create Database Schema (1 hour)
In Supabase SQL Editor, run the complete schema from `PROJECT_ARCHITECTURE.md`:

**Important tables to create in order:**
1. profiles (extends auth.users)
2. courses
3. materials
4. vendor_categories
5. vendors
6. semesters & semester_courses
7. transactions
8. announcements
9. admin_roles
10. activity_logs
11. material_access_logs
12. vendor_reviews

**Test the schema:**
```sql
-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test inserting a course
INSERT INTO courses (course_code, course_title, level, semester, credit_units)
VALUES ('ENG101', 'Introduction to Engineering', 100, 1, 3);

-- Verify
SELECT * FROM courses;
```

#### 4. Setup Row Level Security (45 min)
Enable RLS and create policies as documented in architecture.

**Quick verification:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test profile access
SELECT * FROM profiles WHERE id = auth.uid();
```

### Afternoon Session (2 PM - 6 PM): Authentication & Layout

#### 5. Install shadcn/ui Components (30 min)
```bash
# Install core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
```

#### 6. Create Supabase Client Utilities (30 min)

**File: `lib/supabase/client.ts`**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

**File: `lib/supabase/server.ts`**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
```

**Generate TypeScript types:**
```bash
npx supabase gen types typescript --project-id your-project-id > lib/supabase/database.types.ts
```

#### 7. Build Authentication Pages (2 hours)

**File: `app/(auth)/login/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to EngiPortal</CardTitle>
          <CardDescription>Sign in to access materials and resources</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

**File: `app/(auth)/signup/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    matric_number: '',
    level: '100',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            matric_number: formData.matric_number,
            level: parseInt(formData.level),
          },
        },
      });

      if (authError) throw authError;

      // 2. Create profile
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          matric_number: formData.matric_number,
          level: parseInt(formData.level),
        });

        if (profileError) throw profileError;
      }

      toast.success('Account created! Please check your email to verify.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join EngiPortal to access academic resources</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matric_number">Matric Number</Label>
              <Input
                id="matric_number"
                placeholder="ENG/2024/001"
                value={formData.matric_number}
                onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-slate-500">At least 8 characters</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

#### 8. Create Main Layout with Sidebar (1 hour)

**File: `app/(dashboard)/layout.tsx`**
```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import TopBar from '@/components/layout/top-bar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

**File: `components/layout/sidebar.tsx`**
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Calculator, Store, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'CGPA Calculator', href: '/dashboard/cgpa', icon: Calculator },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Store },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Bell },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar({ user }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold">EngiPortal</h1>
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-3 border-b border-slate-800 p-4">
        <Avatar>
          <AvatarFallback>{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
          <p className="truncate text-xs text-slate-400">{user?.matric_number}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
```

### Evening Session (7 PM - 9 PM): Testing & Documentation

#### 9. Test Authentication Flow (30 min)
1. Start dev server: `npm run dev`
2. Test signup at http://localhost:3000/signup
3. Check email for verification
4. Test login
5. Verify redirect to dashboard
6. Test logout

#### 10. Create README.md (30 min)
Document what you've built, setup instructions, and next steps.

#### 11. Commit Progress (15 min)
```bash
git add .
git commit -m "Day 1: Setup database, auth, and main layout"
git push
```

---

## DAY 2: Materials Library Module

### Morning Session (9 AM - 12 PM): Materials UI

#### 1. Create Materials Page Structure (1 hour)

**File: `app/(dashboard)/materials/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter, Download } from 'lucide-react';
import MaterialCard from '@/components/materials/material-card';

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<string>('all');
  const [semester, setSemester] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  
  const supabase = createClient();

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', level, semester, type, search],
    queryFn: async () => {
      let query = supabase
        .from('materials')
        .select(`
          *,
          courses (
            course_code,
            course_title,
            level,
            semester
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (level !== 'all') {
        query = query.eq('courses.level', parseInt(level));
      }
      
      if (semester !== 'all') {
        query = query.eq('courses.semester', parseInt(semester));
      }
      
      if (type !== 'all') {
        query = query.eq('type', type);
      }
      
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Materials Library</h1>
        <p className="text-slate-600">Access lecture notes, past questions, and study materials</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Level" />
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

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="1">First Semester</SelectItem>
              <SelectItem value="2">Second Semester</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lecture_note">Lecture Notes</SelectItem>
              <SelectItem value="past_question">Past Questions</SelectItem>
              <SelectItem value="textbook">Textbooks</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : materials && materials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No materials found</p>
        </Card>
      )}
    </div>
  );
}
```

---

**[Continue with detailed implementations for Days 3-7...]**

This implementation guide is extensive. Would you like me to:
1. Continue with the remaining days (3-7) in detail?
2. Focus on a specific module (CGPA, Vendors, Payments)?
3. Create additional helper files and utilities?
4. Add testing and deployment guides?
