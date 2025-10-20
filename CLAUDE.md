# village-management-resident-ui Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-16

## Active Technologies

- TypeScript 5.9+ with Next.js 15.5.5 (App Router) + React 19.2.0, @tanstack/react-query, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0 (feat/vehicle-sticker-list)
- Supabase (cloud-hosted PostgreSQL) - existing vehicle_sticker table (feat/vehicle-sticker-list)

- Supabase (PostgreSQL) for data, Supabase Storage for document files (feat/vehicle-sticker-request)

- TypeScript 5.9+ with Next.js 15.5.5 (App Router), React 19.2.0 + react-calendar (date range picker), react-hook-form 7.65.0, zod 4.1.12, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0 (enhc/guest-visit-daterange)
- Supabase (PostgreSQL) - cloud-hosted database with existing guests table (enhc/guest-visit-daterange)

- TypeScript 5.9+ + Next.js 15.5.5 (App Router), React 19.2.0, @supabase/ssr 0.7.0, @supabase/supabase-js 2.75.0 (fix/protected-routes)
- Supabase (cloud-hosted PostgreSQL with authentication) (fix/protected-routes)

- TypeScript 5.7+, Next.js 15 (App Router), React 19 (feat/resident-web-app)

## Project Structure

```
src/
tests/
```

## Commands

npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style

TypeScript 5.7+, Next.js 15 (App Router), React 19: Follow standard conventions

## Recent Changes

- feat/vehicle-sticker-list: Added TypeScript 5.9+ with Next.js 15.5.5 (App Router) + React 19.2.0, @tanstack/react-query, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0

- feat/vehicle-sticker-request: Added TypeScript 5.9+

- enhc/guest-visit-daterange: Added TypeScript 5.9+ with Next.js 15.5.5 (App Router), React 19.2.0 + react-calendar (date range picker), react-hook-form 7.65.0, zod 4.1.12, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
