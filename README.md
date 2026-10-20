# Campus&Me

Campus&Me is a campus platform for engineering students built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase. It brings together study materials, a student marketplace, vendor listings, accommodation, CGPA tracking, and announcements in one place.

## Features

- **Materials Library** — Browse, upload, and download course materials with course/level/semester filters. Approved materials are available to users; premium content is gated behind an active subscription. Downloads and views are tracked.
- **Marketplace** — Buy and sell items with listings, images, boosts, saves, and seller dashboards. Supports student and vendor sellers with slot limits.
- **Vendors** — Vendor directory with profiles, categories, reviews, analytics, subscriptions/tiers, and verification. Vendors can manage listings and track performance.
- **Accommodation** — Browse properties/units, submit leads/viewings, and manage agent submissions.
- **CGPA Tracker** — Add courses/semesters and calculate GPA per semester.
- **Announcements** — Role-scoped announcements (students/faculties/departments/societies) with read tracking.
- **Auth & Roles** — Email/password auth via Supabase with profile data, role-based access (including admin roles stored in `admin_roles`), and subscription status.
- **Admin Panel** — Manage materials (submissions/library/stats), marketplace (listings/reports), vendors, accommodation, agents, and more.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Backend/DB/Auth/Storage**: [Supabase](https://supabase.com/) (Postgres, Auth, Storage)
- **Forms/Validation**: [react-hook-form](https://react-hook-form.com/), [zod](https://zod.dev/)
- **Analytics**: [PostHog](https://posthog.com/), [Vercel Analytics](https://vercel.com/analytics)
- **Monitoring**: [Sentry](https://sentry.io/)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm (or pnpm/yarn/bun)
- A Supabase project with the required schema and storage buckets

### Environment Variables

Create a `.env.local` (or `.env`) file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key  # optional
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host # optional
SENTRY_DSN=your_sentry_dsn                # optional
```

See `AGENTS.md` for database schema notes (roles via `admin_roles`, RLS/client usage).

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Start

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── app/           # Next.js App Router (routes, API handlers)
├── components/    # UI and feature components (shadcn/ui + custom)
├── hooks/         # Custom React hooks
├── lib/           # Shared utilities
└── utils/         # Supabase clients, queries, helpers, constants
```

## License

Private project.
