# Quickstart Guide: Village Management Resident Web Application

**Feature**: `feat/resident-web-app` | **Last Updated**: 2025-10-16

This guide provides step-by-step instructions for setting up the development environment and beginning implementation.

## Prerequisites

Before starting development, ensure you have:

- **Node.js** 20.x or later (LTS recommended)
- **npm** 10.x or later
- **Git** 2.40+
- **Supabase CLI** 1.200.0+ (`npm install -g supabase`)
- **Code Editor** with TypeScript support (VS Code recommended)
- **Supabase Account** (free tier sufficient for development)

## Initial Setup

### 1. Environment Configuration

Create environment files with Supabase credentials:

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these values:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Project Settings → API
4. Copy URL and anon key from "Project API keys" section

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Expected dependencies (from plan.md):
# - next@15+
# - react@19+
# - @supabase/ssr
# - @supabase/supabase-js
# - react-hook-form@7+
# - zod@4+
# - @hookform/resolvers
# - tailwindcss@4+ (CSS-based config)
# - daisyui@5+
# - @tailwindcss/postcss
# - zustand@5+
# - @tanstack/react-table@8+
# - lucide-react
# - clsx
# - vitest
# - @testing-library/react
# - typescript@5.7+
```

### 3. Supabase Project Setup

#### Option A: Link to Existing Supabase Project

```bash
# Initialize Supabase CLI
supabase init

# Link to existing project
supabase link --project-ref your-project-ref

# Pull current schema
supabase db pull
```

#### Option B: Local Development with Supabase

```bash
# Start local Supabase instance (Docker required)
supabase start

# This creates:
# - PostgreSQL database (localhost:54322)
# - Studio UI (http://localhost:54323)
# - API Gateway (http://localhost:54321)
# - Auth server
# - Realtime server
# - Storage server
```

### 4. Database Schema Setup

**IMPORTANT**: The existing schema is missing several tables required by the specification. You need to create migrations for:

- `guest` - Guest pre-authorization
- `announcement` - Village announcements
- `announcement_read` - Announcement read tracking
- `payment` - Household billing (separate from `permit_payment`)
- `incident` - Incident reporting
- `message` - Resident-admin communication
- `notification` - System notifications

**Create migrations:**

```bash
# Generate a new migration file
supabase migration new add_resident_app_tables

# Edit the generated file in supabase/migrations/
# Add CREATE TABLE statements based on data-model.md
```

**Example migration structure (see data-model.md for complete field definitions):**

```sql
-- Create guest table
CREATE TABLE public.guest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenant(id),
  household_id UUID NOT NULL REFERENCES public.household(id),
  authorized_by UUID NOT NULL REFERENCES public.user_profile(id),
  guest_name VARCHAR(200) NOT NULL,
  contact_number VARCHAR(20),
  vehicle_plate VARCHAR(10),
  visit_date DATE NOT NULL,
  expected_time TIME,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  purpose VARCHAR(500) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'approved',
  gate_entry_log_id UUID REFERENCES public.gate_entry_log(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.guest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view household guests"
  ON public.guest FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM public.resident
      WHERE user_profile_id = auth.uid()
    )
  );

-- Repeat for all missing tables...
```

**Apply migrations:**

```bash
# Local development
supabase db reset

# Remote project
supabase db push
```

### 5. Generate TypeScript Types

After applying migrations, regenerate TypeScript types:

```bash
# Generate types from database schema
supabase gen types typescript --local > docs/supabase/database.types.ts

# For remote project:
supabase gen types typescript --project-id your-project-ref > docs/supabase/database.types.ts
```

## Development Workflow

### Project Structure Verification

Ensure your directory structure matches plan.md:

```
village-management-resident-ui/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public auth routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── globals.css        # Tailwind v4 + DaisyUI
│   └── layout.tsx
├── components/
│   ├── ui/               # Base components
│   ├── forms/            # Form components
│   ├── features/         # Feature-specific
│   └── layout/           # Layout components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── schemas/          # Zod schemas
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   └── api/              # API functions
├── types/                # TypeScript types
├── constants/            # App constants
└── store/                # Zustand stores
```

### Starting Development Server

```bash
# Start Next.js dev server
npm run dev

# Runs on http://localhost:3000
```

### Development Best Practices

1. **Always follow constitution principles** (see `.specify/memory/constitution.md`)
2. **Reference existing Supabase types** from `docs/supabase/database.types.ts`
3. **Transform snake_case to camelCase** per naming conventions
4. **Use Zod schemas** for all form validation
5. **Mobile-first design** - test on 320px viewport first
6. **WCAG 2.1 AA compliance** - use semantic HTML and ARIA attributes

### Creating a New Feature Module

Example: Implementing Guest Pre-Authorization

**Step 1: Create Zod schema**

```typescript
// lib/schemas/guest.ts
import { z } from "zod";

export const guestSchema = z.object({
  guestName: z.string().min(1).max(200),
  contactNumber: z
    .string()
    .regex(/^(\+63|0)[0-9]{10}$/)
    .optional(),
  vehiclePlate: z
    .string()
    .regex(/^[A-Z0-9]{6,7}$/)
    .optional(),
  visitDate: z.date().min(new Date()),
  expectedTime: z.string().optional(),
  purpose: z.string().min(3).max(500),
  notes: z.string().max(1000).optional(),
});

export type GuestFormData = z.infer<typeof guestSchema>;
```

**Step 2: Create TypeScript types**

```typescript
// types/guest.ts
import type { Database } from "@/docs/supabase/database.types";

export type Guest = Database["public"]["Tables"]["guest"]["Row"];
export type GuestInsert = Database["public"]["Tables"]["guest"]["Insert"];
export type GuestUpdate = Database["public"]["Tables"]["guest"]["Update"];

// Transformed camelCase version
export interface GuestDto {
  id: string;
  tenantId: string;
  householdId: string;
  authorizedBy: string;
  guestName: string;
  contactNumber?: string;
  vehiclePlate?: string;
  visitDate: string;
  expectedTime?: string;
  actualArrival?: string;
  actualDeparture?: string;
  purpose: string;
  notes?: string;
  status:
    | "pending"
    | "approved"
    | "checked_in"
    | "checked_out"
    | "cancelled"
    | "expired";
  gateEntryLogId?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Step 3: Create API functions**

```typescript
// lib/api/guests.ts
import { createClient } from "@/lib/supabase/client";
import type { Guest, GuestInsert } from "@/types/guest";

export async function getHouseholdGuests(householdId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("guest")
    .select("*")
    .eq("household_id", householdId)
    .order("visit_date", { ascending: false });

  if (error) throw error;
  return data as Guest[];
}

export async function createGuest(guest: GuestInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("guest")
    .insert(guest)
    .select()
    .single();

  if (error) throw error;
  return data as Guest;
}
```

**Step 4: Create custom hook**

```typescript
// lib/hooks/useGuests.ts
import { useState, useEffect } from "react";
import { getHouseholdGuests } from "@/lib/api/guests";
import type { Guest } from "@/types/guest";

export function useGuests(householdId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchGuests() {
      try {
        const data = await getHouseholdGuests(householdId);
        setGuests(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();
  }, [householdId]);

  return { guests, loading, error };
}
```

**Step 5: Create form component**

```typescript
// components/forms/GuestForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { guestSchema, type GuestFormData } from '@/lib/schemas/guest'

export function GuestForm({ onSubmit }: { onSubmit: (data: GuestFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="guestName" className="label">
          <span className="label-text">Guest Name</span>
        </label>
        <input
          {...register('guestName')}
          type="text"
          id="guestName"
          className="input input-bordered w-full"
          data-testid="guest-name-input"
        />
        {errors.guestName && (
          <span className="label-text-alt text-error">{errors.guestName.message}</span>
        )}
      </div>
      {/* Additional form fields... */}
      <button type="submit" className="btn btn-primary" data-testid="submit-guest-btn">
        Pre-Authorize Guest
      </button>
    </form>
  )
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

```typescript
// __tests__/components/GuestForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { GuestForm } from '@/components/forms/GuestForm'

describe('GuestForm', () => {
  it('should validate guest name', async () => {
    const onSubmit = vi.fn()
    render(<GuestForm onSubmit={onSubmit} />)

    const input = screen.getByTestId('guest-name-input')
    const submitBtn = screen.getByTestId('submit-guest-btn')

    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
```

## Common Issues & Troubleshooting

### Issue: Supabase connection fails

**Solution**: Verify environment variables and check Supabase project status

```bash
# Test connection
supabase status

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: TypeScript errors with Database types

**Solution**: Regenerate types after schema changes

```bash
supabase gen types typescript --local > docs/supabase/database.types.ts
```

### Issue: RLS policies blocking queries

**Solution**: Verify RLS policies match user permissions

```sql
-- Test RLS policy
SELECT * FROM guest WHERE household_id = 'some-uuid';

-- Check current user
SELECT auth.uid();
```

### Issue: Tailwind classes not working

**Solution**: Verify Tailwind v4 CSS-based configuration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  /* Add design tokens */
}
```

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production
- [ ] Database migrations applied to production
- [ ] RLS policies tested and verified
- [ ] All tests passing
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No console.log statements in code
- [ ] Accessibility audit passed (Lighthouse)
- [ ] Mobile responsiveness verified (320px - 1920px)
- [ ] Performance metrics meet targets (see plan.md)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Analytics configured (if required)

## Resources

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/](./contracts/)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
- **TailwindCSS v4**: https://tailwindcss.com/docs
- **DaisyUI v5**: https://daisyui.com

## Next Steps

After completing environment setup:

1. Review all API contracts in `contracts/` directory
2. Create database migrations for missing tables
3. Generate TypeScript types from updated schema
4. Begin implementing features following priority order (see spec.md):
   - P1: Guest Pre-Authorization
   - P2: Vehicle Sticker Management
   - P2: Household Profile
   - P3: Announcements
   - P3: Payments
   - P4: Construction Permits
   - P4: Incident Reporting
   - P5: Village Rules
   - P5: Communication

5. Run `/speckit.tasks` to generate detailed implementation task list

---

**Questions or Issues?** Refer to plan.md for architectural decisions and research.md for technical implementation patterns.
