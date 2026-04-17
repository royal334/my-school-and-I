# AGENTS.md - EnGiPortal Codebase Guide

## Project Overview

EnGiPortal is a Next.js 16 application with TypeScript, Tailwind CSS v4, and Supabase backend. It provides educational materials, vendor services, and CGPA tracking for engineering students.

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server at http://localhost:3000
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint with next/core-web-vitals and TypeScript rules
```

### Environment Variables
Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - no implicit any, strict null checks
- Use explicit type annotations for function parameters and return types
- Use `any` sparingly; prefer `unknown` for truly unknown types
- Define interfaces/types in `src/utils/types/` directory
- Database types auto-generated in `src/utils/supabase/database.types.ts`

### File Organization
```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API routes (route.ts files)
│   ├── (auth)/       # Auth pages (login, signup, etc.)
│   └── dashboard/    # Protected dashboard pages
├── components/
│   ├── ui/           # shadcn/ui components (Button, Card, Dialog, etc.)
│   └── [feature]/    # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utilities (utils.ts with cn helper)
└── utils/            # Helper functions, types, Supabase clients
```

### Imports
- Use path alias `@/*` for imports (e.g., `@/components/ui/button`)
- shadcn/ui imports: `@/components/ui/[component]`
- Utils: `import { cn } from "@/lib/utils"`
- Supabase: `import { createClient } from '@/utils/supabase/server'` (server) or `'@/utils/supabase/client'` (client)

### Components
- **Server Components**: Default in Next.js App Router
- **Client Components**: Add `'use client'` directive at the top
- Use functional components with explicit prop interfaces
- shadcn/ui components use `class-variance-authority` for variants

### Naming Conventions
- **Components**: PascalCase (`VendorCard`, `DashboardSidebar`)
- **Hooks**: camelCase with `use` prefix (`useTheme`, `usePdfCache`)
- **Files**: kebab-case for most files (`vendor-card.tsx`), PascalCase for components
- **Types/Interfaces**: PascalCase (`interface VendorCardProps`)
- **API Routes**: kebab-case directories, `route.ts` files

### API Routes
- Located in `src/app/api/`
- Use `NextResponse.json()` for responses
- Return appropriate HTTP status codes (201 created, 400 bad request, 500 server error)
- Validate input and return descriptive error messages
- Example pattern:
```typescript
export async function POST(request: Request) {
  try {
    // Implementation
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Form Handling
- Use `react-hook-form` with `zod` resolvers for validation
- Define schemas in components or separate validation files
- Use shadcn/ui `Form` component

### Styling
- Tailwind CSS v4 with CSS variables
- Use `cn()` utility for conditional class merging
- shadcn/ui components accept `className` prop
- Use Tailwind's dark mode with `dark:` prefix

### Error Handling
- Wrap async operations in try/catch blocks
- Log errors with `console.error()` before returning
- Return user-friendly error messages in API responses
- Use descriptive error messages, not generic ones

### Database (Supabase)
- Use server client for API routes: `createClient(await cookies())`
- Use client client for client components: `createClientComponentClient()`
- Always check for errors from Supabase responses (`if (error) {...}`)
- Use `.select()` with specific columns when possible for performance

### Key Libraries
- **UI**: shadcn/ui (New York style), Radix UI primitives, Lucide icons
- **Forms**: react-hook-form, zod, @hookform/resolvers
- **State**: zustand (if needed)
- **PDF**: pdf-lib, react-pdf
- **Dates**: date-fns
- **Styling**: Tailwind CSS v4, class-variance-authority, tailwind-merge

### ESLint Configuration
Uses `eslint-config-next` with:
- `next/core-web-vitals` - React best practices
- `next/typescript` - TypeScript strict rules

### Notes
- No test framework configured yet
- All UI components are in `src/components/ui/` (managed by shadcn)
- Feature components organized by domain in `src/components/[domain]/`
