# Research & Technical Decisions

**Feature**: Village Management Resident Web Application
**Date**: 2025-10-16
**Status**: Complete

## Overview

This document consolidates research findings and technical decisions for implementing the Village Management Resident Web Application. Each section addresses a specific technical area identified in the implementation plan.

---

## 1. Next.js 15 + React 19 Best Practices

### Decision

Use Next.js 15 App Router with React 19 Server Components for optimal performance and developer experience.

### Rationale

- **App Router** provides better layouts, loading states, and error boundaries
- **React Server Components** reduce client bundle size and improve initial load performance
- **Streaming** enables progressive rendering for better perceived performance
- Next.js 15 offers built-in optimizations for images, fonts, and scripts

### Key Patterns

**Authentication with Middleware**:

- Use Next.js middleware for route protection
- Check Supabase auth state before rendering protected routes
- Redirect unauthenticated users to login
- Handle token refresh automatically

**Server vs Client Components**:

- **Server Components** (default): Data fetching, layouts, static content
- **Client Components** (`'use client'`): Interactive UI, hooks, event handlers, browser APIs
- Keep client components small and focused

**Metadata & SEO**:

- Use `generateMetadata` for dynamic metadata
- Set Open Graph tags for sharing
- Configure PWA manifest for installability

### Implementation Guide

```typescript
// app/(dashboard)/layout.tsx - Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.Node
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return <DashboardShell>{children}</DashboardShell>
}
```

### Alternatives Considered

- **Pages Router**: Rejected - App Router is the recommended approach for new projects
- **Client-only rendering**: Rejected - SSR provides better performance and SEO

---

## 2. Supabase Integration Architecture

### Decision

Use Supabase for authentication, database (PostgreSQL), realtime subscriptions, and file storage with Row-Level Security (RLS) policies.

### Rationale

- **Unified backend**: Single service for auth, data, realtime, storage
- **PostgreSQL**: Robust relational database with ACID guarantees
- **RLS policies**: Database-level security ensures data access control
- **Realtime**: WebSocket subscriptions for live notifications
- **Type generation**: Auto-generate TypeScript types from database schema

### Key Patterns

**Client vs Server Supabase Instances**:

- **Server**: Use in Server Components, Server Actions, Route Handlers
- **Client**: Use in Client Components with `'use client'`

**Row-Level Security (RLS) Design**:

```sql
-- Example: Users can only see their household's guests
CREATE POLICY "Users can view own household guests"
ON guests FOR SELECT
USING (household_id IN (
  SELECT household_id FROM users WHERE id = auth.uid()
));
```

**Realtime Subscriptions**:

- Subscribe to database changes for real-time updates
- Use for notifications, guest arrivals, announcement updates
- Clean up subscriptions on component unmount

**File Upload Strategy**:

- Use Supabase Storage buckets (public/private)
- Generate signed URLs for private files
- Implement client-side validation before upload
- Store file metadata in database tables

### Implementation Guide

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );
}
```

### Alternatives Considered

- **Firebase**: Rejected - PostgreSQL preferred over NoSQL for complex relationships
- **Custom backend**: Rejected - Supabase provides faster development with built-in features

---

## 3. Form Management Strategy

### Decision

Use React Hook Form with Zod schemas for type-safe form validation and management.

### Rationale

- **Type Safety**: Zod schemas provide runtime validation + TypeScript types
- **Performance**: React Hook Form minimizes re-renders
- **Developer Experience**: Simple API with excellent TypeScript support
- **Schema Reuse**: Zod schemas work for both client and server validation

### Key Patterns

**Form Schema Definition**:

```typescript
// lib/schemas/guest.ts
import { z } from "zod";

export const guestFormSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  phone: z.string().optional(),
  vehiclePlate: z.string().optional(),
  purpose: z.string().min(1, "Purpose is required"),
  expectedArrivalDate: z.date(),
  expectedArrivalTime: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type GuestFormData = z.infer<typeof guestFormSchema>;
```

**Form Component Pattern**:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function GuestForm() {
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
  })

  const onSubmit = async (data: GuestFormData) => {
    // Handle submission
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

**Multi-step Forms**:

- Use state machine or step counter
- Validate each step before proceeding
- Persist form state in localStorage for recovery
- Show progress indicator

**File Uploads in Forms**:

- Handle File objects in form state
- Validate file size/type before submission
- Show upload progress
- Compress images client-side before upload

### Alternatives Considered

- **Formik**: Rejected - React Hook Form has better performance
- **Plain React state**: Rejected - Too manual, lacks validation integration

---

## 4. State Management Architecture

### Decision

Use Zustand for client-side global state management alongside React Server Components for server state.

### Rationale

- **Minimal boilerplate**: Simpler than Redux, more powerful than Context API
- **TypeScript support**: Excellent type inference
- **Devtools integration**: Easy debugging
- **Middleware support**: Persist, immer, subscriptions
- **Server state separation**: Use Supabase queries for server data, Zustand for UI state

### Key Patterns

**State Organization**:

- **authStore**: Current user, session, permissions
- **notificationStore**: In-app notifications, unread counts
- **uiStore**: Sidebar open/closed, modal state, toast messages

**Store Example**:

```typescript
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
```

**Server State vs Client State**:

- **Server State** (from Supabase): Guests, Stickers, Payments, Announcements
- **Client State** (Zustand): UI preferences, notification panel state, active filters

### Alternatives Considered

- **Redux Toolkit**: Rejected - More boilerplate than needed
- **React Context**: Rejected - Performance issues with frequent updates
- **TanStack Query**: Considered for server state caching but Supabase handles this

---

## 5. Real-time Notifications Architecture

### Decision

Use Supabase Realtime for database change subscriptions combined with Browser Notification API for system notifications.

### Rationale

- **Supabase Realtime**: Built-in WebSocket support for database changes
- **Browser Notifications**: Native OS notifications for critical alerts
- **Graceful degradation**: Fall back to in-app notifications if permission denied

### Key Patterns

**Realtime Subscription Setup**:

```typescript
// lib/hooks/useRealtime.ts
useEffect(() => {
  const channel = supabase
    .channel("guest-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "guests",
        filter: `household_id=eq.${householdId}`,
      },
      (payload) => {
        // Handle new guest notification
        showNotification("New guest arrival", payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [householdId]);
```

**Browser Notification Flow**:

1. Request permission on first load (non-intrusive prompt)
2. Store permission state in Zustand
3. Show browser notification for critical events (guest arrival, payment due)
4. Provide in-app fallback if permission denied
5. Handle notification click actions

**Notification Types by Priority**:

- **Critical** (browser + in-app): Guest arrival, walk-in approval request
- **High** (browser or in-app): Payment overdue, sticker suspension
- **Normal** (in-app only): Announcements, incident updates
- **Low** (in-app only): Receipt confirmations

### Implementation Guide

```typescript
// lib/hooks/useNotifications.ts
export function useNotifications() {
  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  const showNotification = (
    title: string,
    body: string,
    actions?: NotificationAction[],
  ) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon.png", actions });
    } else {
      // Fallback to in-app toast
      showToast(title, body);
    }
  };

  return { requestPermission, showNotification };
}
```

### Alternatives Considered

- **Custom WebSocket**: Rejected - Supabase Realtime provides this
- **Polling**: Rejected - Real-time subscriptions are more efficient

---

## 6. Offline Support & PWA Strategy

### Decision

Implement Progressive Web App with service worker for offline caching and background sync.

### Rationale

- **Improved UX**: App works without internet for cached data
- **Installability**: Users can add to home screen
- **Background sync**: Queue actions when offline, sync when reconnected
- **Cache strategies**: Different strategies for different data types

### Key Patterns

**Service Worker Registration**:

```typescript
// app/layout.tsx
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

**Cache Strategies by Data Type**:

- **Guests (30 days)**: Network-first, cache fallback
- **Stickers**: Cache-first for active stickers
- **Announcements (60 days)**: Network-first with cache fallback
- **Payment history (12 months)**: Cache-first
- **Access logs (30 days)**: Network-first

**Background Sync for Actions**:

- Queue form submissions when offline
- Sync when connection restored
- Show sync status indicator
- Handle conflicts (last-write-wins for most cases)

**PWA Manifest**:

```json
{
  "name": "Village Resident App",
  "short_name": "Resident",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#primary-color",
  "icons": [...]
}
```

### Alternatives Considered

- **No offline support**: Rejected - Important for mobile-first app
- **Full offline functionality**: Rejected - Complex for forms, read-only cache sufficient

---

## 7. Performance Optimization

### Decision

Implement code splitting, image optimization, lazy loading, and bundle size optimization.

### Rationale

- **Target**: Initial load < 3s on 4G, navigation < 300ms
- **Mobile-first**: Optimize for slower connections
- **Core Web Vitals**: Target LCP < 2.5s, FID < 100ms, CLS < 0.1

### Key Patterns

**Code Splitting**:

```typescript
// Lazy load heavy components
const PaymentGateway = dynamic(() => import('./PaymentGateway'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only component
})
```

**Image Optimization**:

```typescript
import Image from 'next/image'

<Image
  src="/sticker-photo.jpg"
  alt="Vehicle sticker"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**Bundle Size Optimization**:

- Use barrel imports carefully (import specific exports)
- Analyze bundle with `@next/bundle-analyzer`
- Tree-shake unused code
- Use dynamic imports for large dependencies

**Database Query Optimization**:

- Index foreign keys and frequently queried columns
- Use `.select()` to fetch only needed columns
- Paginate large datasets with TanStack Table
- Use Supabase query caching

### Alternatives Considered

- **Client-side pagination**: Implemented with TanStack Table for better UX
- **Infinite scroll**: Rejected for tables, implemented for announcement feeds

---

## 8. Accessibility Implementation

### Decision

Implement WCAG 2.1 AA compliance with semantic HTML, ARIA attributes, keyboard navigation, and screen reader support.

### Rationale

- **Legal requirement**: Many jurisdictions require AA compliance
- **Better UX**: Benefits all users, not just those with disabilities
- **Mobile-first**: Touch targets, readable text, good contrast

### Key Patterns

**Semantic HTML**:

```tsx
<nav aria-label="Primary navigation">
  <button aria-label="Toggle menu" aria-expanded={isOpen}>
    <Menu />
  </button>
</nav>
```

**Keyboard Navigation**:

- Tab order follows visual order
- Escape closes modals/dropdowns
- Enter/Space activates buttons
- Arrow keys navigate lists/menus

**Focus Management**:

```typescript
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
    // Trap focus within modal
  }
}, [isOpen]);
```

**Color Contrast**:

- Use DaisyUI color system (AA compliant)
- Test with contrast checker tools
- Provide text alternatives for color-coded information

**Touch Targets**:

- Minimum 44x44px for all interactive elements
- Adequate spacing between clickable elements
- Large enough form inputs for mobile

### Testing Approach

- **axe DevTools**: Automated accessibility testing
- **Lighthouse**: Accessibility audit in Chrome DevTools
- **Screen reader testing**: Test with VoiceOver (Mac) or NVDA (Windows)
- **Keyboard-only navigation**: Test all flows without mouse

### Alternatives Considered

- **AAA compliance**: Rejected - AA is industry standard, AAA is aspirational

---

## 9. Design Token System

### Decision

Use Tailwind CSS v4 @theme with DaisyUI v5 themes for design tokens and theming.

### Rationale

- **No config file**: Tailwind v4 uses CSS-based configuration
- **Design tokens**: Centralized color, spacing, typography definitions
- **Theme switching**: DaisyUI provides easy light/dark mode
- **Type safety**: TypeScript autocomplete for theme values

### Implementation

**globals.css Configuration**:

```css
@import "tailwindcss";
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: "light";
  default: true;
  --color-primary: #3b82f6; /* Blue */
  --color-secondary: #8b5cf6; /* Purple */
  --color-accent: #10b981; /* Green */
  --color-neutral: #374151; /* Gray */
  --color-base-100: #ffffff;
  --color-base-200: #f3f4f6;
  --color-base-300: #e5e7eb;
  --color-info: #0ea5e9;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

@plugin "daisyui/theme" {
  name: "dark";
  --color-primary: #60a5fa;
  --color-secondary: #a78bfa;
  --color-accent: #34d399;
  --color-neutral: #d1d5db;
  --color-base-100: #1f2937;
  --color-base-200: #111827;
  --color-base-300: #0f172a;
  --color-info: #38bdf8;
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}

@theme {
  /* Extended color scales */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Spacing scale (golden ratio: 1.618) */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 0.809rem; /* 13px */
  --spacing-lg: 1.309rem; /* 21px */
  --spacing-xl: 2.118rem; /* 34px */
  --spacing-2xl: 3.427rem; /* 55px */

  /* Typography scale (golden ratio) */
  --font-size-xs: 0.694rem; /* 11px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.618rem; /* 26px */
  --font-size-2xl: 2.618rem; /* 42px */
  --font-size-3xl: 4.236rem; /* 68px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

**Using Design Tokens**:

```tsx
// Components use Tailwind classes that map to design tokens
<button className="bg-primary text-primary-content px-lg py-md rounded-md shadow-md">
  Submit
</button>
```

### Alternatives Considered

- **CSS Variables only**: Rejected - DaisyUI provides better component theming
- **Styled Components**: Rejected - Tailwind CSS preferred per user requirements

---

## 10. Payment Gateway Integration

### Decision

Integrate PayMongo as primary gateway with GCash and PayMaya as payment methods.

### Rationale

- **Philippine market**: PayMongo supports local payment methods
- **Security**: PCI-DSS compliant, handles sensitive data
- **Developer experience**: Good API documentation, webhook support
- **Payment methods**: Credit card, GCash, PayMaya, bank transfers

### Key Patterns

**Payment Flow**:

1. User selects payment method and amount
2. Frontend creates payment intent via API route
3. Redirect to PayMongo checkout or embed payment form
4. PayMongo processes payment
5. Webhook notifies backend of payment status
6. Update payment record in database
7. Send confirmation notification to user

**Security Considerations**:

- Never store card details (PayMongo handles this)
- Use HTTPS only
- Verify webhook signatures
- Implement idempotency for payment requests
- Log all payment attempts for audit

**Error Handling**:

```typescript
try {
  const payment = await processPayment(amount, method);
  showToast("Payment successful", "success");
  downloadReceipt(payment.receiptUrl);
} catch (error) {
  if (error.code === "insufficient_funds") {
    showToast("Insufficient funds", "error");
  } else if (error.code === "payment_declined") {
    showToast("Payment declined, try another method", "error");
  } else {
    showToast("Payment failed, please try again", "error");
  }
}
```

**Receipt Generation**:

- Generate PDF receipts using a library (jsPDF or server-side generation)
- Store receipt URL in payment record
- Email receipt to user
- Allow re-download from payment history

### Implementation Notes

- Use environment variables for API keys (never commit)
- Test with PayMongo test mode before production
- Implement retry logic for failed webhooks
- Monitor payment success/failure rates

### Alternatives Considered

- **Stripe**: Rejected - Better support for PH payment methods needed
- **Manual payment tracking**: Rejected - Gateway provides better UX and security

---

## 11. File Upload & Compression

### Decision

Use browser-native File API with client-side compression before upload to Supabase Storage.

### Rationale

- **User experience**: Show progress, validate early
- **Performance**: Compress images before upload saves bandwidth
- **Cost**: Smaller files reduce storage costs
- **Validation**: Check file type and size client-side

### Key Patterns

**File Upload Component**:

```typescript
'use client'

import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'

export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [progress, setProgress] = useState(0)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        let fileToUpload = file

        // Compress images
        if (file.type.startsWith('image/')) {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(`${userId}/${file.name}`, fileToUpload, {
            onUploadProgress: (e) => {
              setProgress((e.loaded / e.total) * 100)
            },
          })

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(data.path)

          onUpload(publicUrl)
        }
      }
    },
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-6 cursor-pointer">
      <input {...getInputProps()} />
      <p>Drag & drop files here, or click to select</p>
      {progress > 0 && <progress value={progress} max={100} />}
    </div>
  )
}
```

**File Type Validation**:

- Images: JPEG, PNG (compress before upload)
- Documents: PDF (no compression needed)
- Maximum size: 10MB per file
- Total transaction: 50MB max

**Storage Organization**:

```
supabase-storage/
├── documents/
│   ├── {userId}/
│   │   ├── or-cr-{stickerId}.pdf
│   │   ├── permit-{permitId}.pdf
│   │   └── incident-{incidentId}.jpg
```

### Alternatives Considered

- **Server-side compression**: Rejected - Client-side reduces server load
- **Third-party storage (AWS S3)**: Rejected - Supabase Storage simpler integration

---

## 12. Testing Strategy

### Decision

Use Vitest for unit tests, React Testing Library for component tests, with test coverage for critical user flows.

### Rationale

- **Vitest**: Fast, modern, Vite-based testing framework
- **React Testing Library**: Encourages testing user behavior, not implementation
- **Coverage**: Focus on critical paths (authentication, payments, guest approval)

### Key Patterns

**Component Test Example**:

```typescript
// __tests__/components/GuestForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GuestForm } from '@/components/forms/GuestForm'

describe('GuestForm', () => {
  it('validates required fields', async () => {
    render(<GuestForm />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Guest name is required')).toBeInTheDocument()
    })
  })

  it('submits valid form data', async () => {
    const onSubmit = vi.fn()
    render(<GuestForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/guest name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/purpose/i), {
      target: { value: 'Visit' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          guestName: 'John Doe',
          purpose: 'Visit',
        })
      )
    })
  })
})
```

**Mocking Supabase**:

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
  }),
}));
```

**Test Coverage Targets**:

- **Critical flows**: 80%+ coverage (auth, payments, guest approval)
- **UI components**: 60%+ coverage
- **Utilities**: 90%+ coverage
- **Overall**: 70%+ coverage

**Testing Checklist**:

- ✅ All forms validate correctly
- ✅ Data fetching handles loading/error states
- ✅ User interactions trigger expected actions
- ✅ Accessibility attributes present (data-testid, aria-labels)
- ✅ Error boundaries catch errors gracefully

### Alternatives Considered

- **Jest**: Rejected - Vitest is faster and more modern
- **Cypress/Playwright**: Considered for E2E but not initially required
- **Storybook**: Considered for component library but not initially required

---

## Summary

All research areas have been addressed with clear decisions, rationale, implementation patterns, and alternatives considered. The technical stack is:

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **State**: Zustand for client state, Supabase for server state
- **Tables**: TanStack Table
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **PWA**: Service worker with caching strategies
- **Payments**: PayMongo (GCash, PayMaya, Credit Card)

All decisions align with the project constitution and support the functional requirements defined in the specification.

**Next Phase**: Proceed to Phase 1 for data model and API contract definitions.
