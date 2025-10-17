# Research: Guest Visit Date Range Picker

**Feature**: Guest Visit Date Range Picker
**Date**: 2025-10-17
**Status**: Completed

## Overview

This document consolidates research findings for implementing a date range picker in the guest pre-authorization form. The research covers library selection, accessibility compliance, integration patterns, and best practices for the chosen technology stack (React 19, react-hook-form, TypeScript, Tailwind CSS).

## Library Selection: react-calendar

### Decision

**Chosen**: `react-calendar` by wojtekmaj (https://github.com/wojtekmaj/react-calendar)

### Rationale

1. **Date Range Support**: Native `selectRange` prop enables two-date selection out-of-box
2. **React Compatibility**: Supports React 16.8+ (we're on React 19.2.0)
3. **TypeScript Support**: Fully typed with included type definitions
4. **Lightweight**: No heavy dependencies, uses browser-native Intl API
5. **Customizable**: Multiple styling approaches including className props and custom formatters
6. **Modern**: Uses hooks-compatible patterns, supports controlled/uncontrolled modes
7. **Active Maintenance**: Well-maintained with regular updates

### Alternatives Considered

| Library                     | Reason for Rejection                                           |
| --------------------------- | -------------------------------------------------------------- |
| react-datepicker            | Heavier dependency footprint, more opinionated styling         |
| react-day-picker            | More complex API for simple date range use case                |
| Material-UI DateRangePicker | Requires full Material-UI installation, conflicts with DaisyUI |
| Custom implementation       | Unnecessarily complex for established accessibility patterns   |

## Accessibility Compliance (WCAG 2.1 AA)

### react-calendar Accessibility Features

**Built-in Support**:

- ✅ Keyboard navigation (arrow keys, Enter/Space for selection)
- ✅ ARIA labels via props (`navigationAriaLabel`, `next2AriaLabel`, etc.)
- ✅ `navigationAriaLive` for announcing changes to screen readers
- ✅ Follows WAI-ARIA calendar widget patterns
- ✅ RTL language support (automatic keyboard navigation flip)

**Limitations Identified**:

- ⚠️ Documentation doesn't explicitly claim WCAG 2.1 AA compliance
- ⚠️ ARIA labels must be manually configured (not set by default)
- ⚠️ No built-in aria-live region for date selection announcements

### Mitigation Strategy

To achieve WCAG 2.1 AA compliance, we will:

1. **Wrapper Component** (`DateRangePicker.tsx`):
   - Add comprehensive ARIA labels to all interactive elements
   - Implement aria-live region for selection announcements
   - Ensure minimum touch target size (44x44px per constitution)
   - Add visible focus indicators with proper contrast ratios

2. **Keyboard Navigation**:
   - Test and document keyboard shortcuts
   - Ensure Tab key properly moves focus in/out of calendar
   - Verify arrow keys work for date navigation
   - Confirm Enter/Space keys trigger date selection

3. **Screen Reader Support**:
   - Add aria-live="polite" region to announce selected dates
   - Use aria-describedby to link help text
   - Provide clear aria-label for calendar container
   - Announce date range format and constraints

4. **Visual Accessibility**:
   - Ensure 4.5:1 contrast ratio for text (WCAG AA)
   - Add focus indicators visible to keyboard users
   - Support prefers-reduced-motion for animations
   - Test with browser zoom up to 200%

## Integration with react-hook-form

### Approach

Use the `Controller` component from react-hook-form to integrate react-calendar:

```typescript
import { Controller } from "react-hook-form";
import Calendar from "react-calendar";

<Controller
  name="visitDateRange"
  control={control}
  rules={{ required: "Visit dates are required" }}
  render={({ field, fieldState }) => (
    <DateRangePicker
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

### Best Practices (2025)

1. **Use Controller for External Components**: react-hook-form's `Controller` is the recommended pattern for integrating third-party controlled components
2. **Leverage Uncontrolled Performance**: While the calendar is controlled, react-hook-form minimizes re-renders through its internal optimization
3. **Field-level Validation**: Combine zod schema validation with Controller's `rules` prop for comprehensive validation
4. **Error Handling**: Access `fieldState.error` from Controller's render prop for error display

### State Management Pattern

```typescript
// Form schema with date range
const schema = z.object({
  visitDateStart: z.string().refine(isNotPastDate, "Cannot be in past"),
  visitDateEnd: z.string().refine((end, ctx) => {
    const start = ctx.parent.visitDateStart;
    return new Date(end) >= new Date(start);
  }, "End date must be after start date"),
  visitDuration: z.number().optional(), // Auto-calculated
});

// Custom hook handles date range logic
function useDateRange() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleChange = (dates: Date | [Date, Date]) => {
    if (Array.isArray(dates)) {
      setRange(dates);
      // Auto-fill end date if only start selected
      if (dates[0] && !dates[1]) {
        setRange([dates[0], dates[0]]);
      }
    }
  };

  return { range, handleChange };
}
```

## Styling with Tailwind CSS

### Strategy

1. **CSS Module Approach**:
   - Import base styles: `import 'react-calendar/dist/Calendar.css'`
   - Override with Tailwind utility classes via `className` prop
   - Use DaisyUI theme colors for consistency

2. **Component-level Customization**:

   ```typescript
   <Calendar
     className="rounded-lg border-2 border-neutral/20"
     tileClassName={({ date, view }) =>
       clsx(
         "hover:bg-primary-100",
         "focus:ring-2 focus:ring-primary-500"
       )
     }
   />
   ```

3. **Dark Mode Support**:
   - Use Tailwind's dark mode classes
   - Ensure color contrast in both light/dark themes
   - Test with constitution's dark mode requirement

## Data Model & API Mapping

### Schema Changes

**Before**:

```typescript
{
  expectedArrivalDate: string;
  expectedArrivalTime?: string;
}
```

**After**:

```typescript
{
  visitDateStart: string; // ISO 8601 date
  visitDateEnd: string;   // ISO 8601 date
  visitDuration: number;  // Auto-calculated days
  expectedArrivalTime?: string; // Kept for backward compatibility
}
```

### API Transformation (createGuest function)

**Frontend → Backend Mapping**:

```typescript
// lib/api/guests.ts
function mapGuestToAPI(guest: CreateGuestInput) {
  return {
    guest_name: guest.guestName,
    phone: guest.phone,
    vehicle_plate: guest.vehiclePlate,
    purpose: guest.purpose,
    visit_start_date: guest.visitDateStart, // NEW: renamed from expected_arrival_date
    visit_end_date: guest.visitDateEnd, // NEW: added
    visit_duration: guest.visitDuration, // NEW: auto-calculated
    expected_arrival_time: guest.expectedArrivalTime,
    special_instructions: guest.specialInstructions,
  };
}
```

### Duration Calculation

```typescript
// lib/utils/dateHelpers.ts
export function calculateVisitDuration(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end day
}
```

## Component Architecture

### Component Hierarchy

```
GuestForm (feature component)
  └─ Controller (react-hook-form)
      └─ DateRangePicker (wrapper component)
          └─ Calendar (styled react-calendar)
```

### Responsibilities

1. **DateRangePicker** (components/ui/DateRangePicker.tsx):
   - Wraps react-calendar with accessibility enhancements
   - Handles ARIA labels and live regions
   - Manages validation error display
   - Provides consistent styling via Tailwind
   - Enforces touch target sizes

2. **Calendar** (components/ui/Calendar.tsx):
   - Styled wrapper around react-calendar
   - Applies DaisyUI theme colors
   - Configures default props (locale, min/max dates)
   - Custom tile rendering for disabled states

3. **useDateRange** (hooks/useDateRange.ts):
   - Custom hook for date range state
   - Handles auto-fill logic (end date defaults to start date)
   - Calculates visit duration
   - Provides validation helpers

4. **dateHelpers** (lib/utils/dateHelpers.ts):
   - Pure utility functions for date operations
   - calculateVisitDuration
   - formatDateRange (for display)
   - isValidDateRange (validation)

## Validation Strategy

### Multi-layer Validation

1. **UI Layer** (DateRangePicker):
   - Disable past dates via `minDate` prop
   - Disable dates beyond 30 days via `maxDate` prop
   - Visual feedback for invalid selections

2. **Form Layer** (react-hook-form):
   - Controller `rules` for required fields
   - Real-time validation on change

3. **Schema Layer** (zod):
   - `visitDateStart` cannot be in past
   - `visitDateEnd` >= `visitDateStart`
   - `visitDateStart` <= today + 30 days
   - Type safety for date formats

4. **API Layer** (backend):
   - Server-side validation as final check
   - Database constraints enforce data integrity

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Import react-calendar dynamically if not immediately visible
2. **Memoization**: Use `useMemo` for calculated values (duration, formatted dates)
3. **Debouncing**: Debounce validation during rapid date changes
4. **Bundle Size**: react-calendar is ~30KB gzipped (acceptable)

### Performance Goals (from Technical Context)

- ✅ Date picker interactions <100ms - react-calendar is lightweight
- ✅ Form validation instant (<50ms) - zod validation is synchronous and fast
- ✅ Form submission <2s - API call performance depends on backend

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/DateRangePicker.test.tsx
describe("DateRangePicker", () => {
  it("should auto-fill end date when only start selected", () => {});
  it("should prevent selecting past dates", () => {});
  it("should enforce 30-day advance booking limit", () => {});
  it("should calculate visit duration correctly", () => {});
  it("should handle keyboard navigation", () => {});
  it("should announce selections to screen readers", () => {});
});
```

### Integration Tests

- Test GuestForm with date range picker
- Verify form submission with date range data
- Test validation error states
- Verify API mapping transformation

### Accessibility Tests

- Automated: axe-core via vitest-axe
- Manual: Screen reader testing (VoiceOver/NVDA)
- Manual: Keyboard-only navigation
- Manual: Color contrast verification

## Dependencies to Add

```json
{
  "dependencies": {
    "react-calendar": "^5.1.0"
  },
  "devDependencies": {
    "@types/react-calendar": "^4.1.0"
  }
}
```

## Implementation Risks & Mitigations

| Risk                                    | Likelihood | Impact | Mitigation                                                    |
| --------------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| Accessibility gaps in react-calendar    | Medium     | High   | Wrapper component adds missing ARIA, comprehensive testing    |
| Breaking changes to existing guests API | Low        | High   | Coordinate with backend team, maintain backward compatibility |
| Touch target size on mobile             | Medium     | Medium | Enforce 44x44px minimum via CSS, test on devices              |
| Date format inconsistencies             | Low        | Medium | Use ISO 8601 throughout, document format in types             |
| Performance issues on older devices     | Low        | Low    | Lazy load calendar, test on target devices                    |

## Open Questions (Resolved)

1. ✅ **Does react-calendar support WCAG 2.1 AA?**
   - Partially. Will enhance with wrapper component.

2. ✅ **How to integrate with react-hook-form?**
   - Use Controller component with controlled calendar.

3. ✅ **Should visit duration be stored or calculated?**
   - Auto-calculated and stored for query performance.

4. ✅ **Backward compatibility for expectedArrivalDate?**
   - Map visitDateStart to expected_arrival_date if backend needs it.

5. ✅ **Maximum visit duration limit?**
   - No hard limit in spec, but 30-day advance booking applies to start date.

## Next Steps

Phase 0 (Research) is complete. Ready to proceed to:

- **Phase 1**: Generate data-model.md, contracts/, and quickstart.md
- **Phase 2**: Generate tasks.md with dependency-ordered implementation steps

---

**Research Complete**: All technical unknowns resolved. Implementation can proceed with confidence.
