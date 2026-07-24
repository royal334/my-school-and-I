# AGENTS.md - EnGiPortal Codebase Guide

## Project Overview

EnGiPortal is a Next.js 16 app with TypeScript, Tailwind CSS v4, and Supabase backend. Educational materials, vendor services, and CGPA tracking for engineering students.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint (next/core-web-vitals + typescript)
```

No test framework configured. Typecheck with `npx tsc --noEmit`.

## Environment

Required in `.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema (Critical)

The `profiles` table does NOT have a `role` or `announcement_role` column. Roles work via a foreign key:

- `profiles.role_id` → `admin_roles.id`
- `admin_roles` table has columns: `id`, `user_id`, `role` (the role name string)
- Role names: `super_admin`, `admin`, `faculty_president`, `departmental_president`, `course_rep`, `department_admin`, `student_union_rep`

### Fetching roles — DO NOT use Supabase join syntax

The FK constraint name `profiles_role_id_fkey` does not work in client-side `.select()` joins. Always fetch profile and role separately:

```typescript
// ✅ Correct — two separate queries
const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', userId).maybeSingle();

// ❌ Wrong — join syntax fails on client side
supabase.from('profiles').select('*, role:admin_roles!profiles_role_id_fkey (role)')
```

Server-side API routes CAN use the join syntax (it works in the GET announcements endpoint).

### Supabase Edge Functions reference table `admin_roles`, NOT `roles`

Any SQL functions (RLS helpers, permission checks) must use `admin_roles` as the table name and `r.role` as the column (not `r.name`).

## File Structure

```
src/
├── app/
│   ├── api/              # API routes (route.ts)
│   │   └── announcements/
│   ├── (auth)/           # Login, signup pages
│   └── dashboard/
│       └── announcements/
├── components/
│   ├── ui/               # shadcn/ui components
│   └── announcements/    # announcement-feed.tsx, announcement-form.tsx
├── hooks/                # use-session.ts (client auth hook)
├── lib/                  # utils.ts (cn helper)
└── utils/
    ├── supabase/
    │   ├── client.ts     # Browser client: createClient()
    │   └── server.ts     # Server client: createClient(await cookies())
    └── queries/          # Database query helpers
```

## Supabase Clients

- **Client components**: `import { createClient } from '@/utils/supabase/client'`
- **Server (API routes, pages)**: `import { createClient } from '@/utils/supabase/server'` — requires `await cookies()`
- **Client components must NOT use the server client** and vice versa

## Announcement System

- Feed and form fetch their own auth/profile directly via `supabase.auth.getUser()` — they do NOT use `useSession`
- The form fetches profile fields (`faculty_id`, `department_id`, `level`) and role separately, then computes allowed scopes client-side via `getAllowedScopes()`
- API routes handle permission checks server-side using the `admin_roles` table
- `sender_role` column in announcements stores the role string at send time

## Key Libraries

- **UI**: shadcn/ui (New York style), Radix UI, Lucide icons
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Styling**: Tailwind CSS v4, class-variance-authority, tailwind-merge
- **Dates**: date-fns
- **PDF**: pdf-lib, react-pdf

## Code Conventions

- Client components use `'use client'` directive
- Path alias `@/*` for all imports
- `cn()` utility for conditional classes
- API routes return `NextResponse.json()` with appropriate status codes
- Strict TypeScript — avoid `any`, use explicit types
- Feature components in `src/components/[domain]/`
