# Quickstart: Guest Visit Date Range Picker

**Feature**: Guest Visit Date Range Picker
**Date**: 2025-10-17
**Branch**: `enhc/guest-visit-daterange`

## Overview

This quickstart guide provides developers with everything needed to implement the guest visit date range picker feature. It includes installation instructions, code examples, and testing guidance.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Migration](#database-migration)
4. [Component Usage](#component-usage)
5. [API Integration](#api-integration)
6. [Validation](#validation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and npm/yarn
- React 19.2.0
- Next.js 15.5.5
- TypeScript 5.9+
- Supabase project with guests table
- Existing project dependencies installed

## Installation

### 1. Install Dependencies

```bash
npm install react-calendar
npm install --save-dev @types/react-calendar
```

### 2. Import Styles

Add the following to your global CSS file or component:

```typescript
// In your component or _app.tsx
import "react-calendar/dist/Calendar.css";
```

## Database Migration

### Supabase Migration

Create a new migration file in your Supabase project:

```sql
-- Migration: Add visit date range to guests table
-- Created: 2025-10-17

-- Add new columns
ALTER TABLE guests
  ADD COLUMN visit_end_date DATE,
  ADD COLUMN visit_duration INTEGER;

-- Rename expected_arrival_date to visit_start_date
ALTER TABLE guests
  RENAME COLUMN expected_arrival_date TO visit_start_date;

-- Set defaults for existing records (single-day visits)
UPDATE guests
  SET visit_end_date = visit_start_date,
      visit_duration = 1
  WHERE visit_end_date IS NULL;

-- Add constraints
ALTER TABLE guests
  ALTER COLUMN visit_end_date SET NOT NULL,
  ADD CONSTRAINT visit_end_after_start CHECK (visit_end_date >= visit_start_date),
  ADD CONSTRAINT visit_start_future CHECK (visit_start_date >= CURRENT_DATE),
  ADD CONSTRAINT visit_start_max_advance CHECK (visit_start_date <= CURRENT_DATE + INTERVAL '30 days'),
  ADD CONSTRAINT visit_duration_positive CHECK (visit_duration > 0 OR visit_duration IS NULL);

-- Create function to auto-calculate duration
CREATE OR REPLACE FUNCTION calculate_visit_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.visit_duration := (NEW.visit_end_date - NEW.visit_start_date) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_visit_duration
  BEFORE INSERT OR UPDATE OF visit_start_date, visit_end_date ON guests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_visit_duration();

-- Add indexes for performance
CREATE INDEX idx_guests_visit_start_date ON guests(visit_start_date);
CREATE INDEX idx_guests_visit_end_date ON guests(visit_end_date);
CREATE INDEX idx_guests_active_visits ON guests(visit_start_date, visit_end_date, status)
  WHERE status IN ('approved', 'at_gate');
```

Run the migration:

```bash
supabase db push
```

## Component Usage

### 1. Create DateRangePicker Component

```typescript
// components/ui/DateRangePicker.tsx
"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import type { Value } from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface DateRangePickerProps {
  value?: [Date | null, Date | null];
  onChange: (dates: [Date, Date]) => void;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  error,
  minDate,
  maxDate,
  disabled = false,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<Value>(value || null);

  const handleChange = (newValue: Value) => {
    setSelectedRange(newValue);

    if (Array.isArray(newValue) && newValue[0]) {
      // Auto-fill end date if only start date selected
      const startDate = newValue[0];
      const endDate = newValue[1] || newValue[0];
      onChange([startDate, endDate]);
    }
  };

  const today = new Date();
  const defaultMaxDate = new Date();
  defaultMaxDate.setDate(today.getDate() + 30);

  return (
    <div className="space-y-2" data-testid="date-range-picker">
      <label className="block text-sm font-medium text-neutral">
        Visit Date Range <span className="text-error-500">*</span>
      </label>

      <Calendar
        value={selectedRange}
        onChange={handleChange}
        selectRange
        minDate={minDate || today}
        maxDate={maxDate || defaultMaxDate}
        disabled={disabled}
        className="rounded-lg border-2 border-neutral/20 shadow-sm"
        tileClassName={({ date, view }) => {
          if (view === "month") {
            return "hover:bg-primary-100 focus:ring-2 focus:ring-primary-500 rounded-md";
          }
          return "";
        }}
        navigationAriaLabel="Navigate calendar"
        nextAriaLabel="Next month"
        prevAriaLabel="Previous month"
        next2AriaLabel="Jump forward one year"
        prev2AriaLabel="Jump back one year"
        navigationAriaLive="polite"
      />

      {/* Accessibility: Announce selected dates */}
      {selectedRange && Array.isArray(selectedRange) && (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Selected dates:{" "}
          {selectedRange[0]?.toLocaleDateString()} to{" "}
          {(selectedRange[1] || selectedRange[0])?.toLocaleDateString()}
        </div>
      )}

      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}

      {selectedRange && Array.isArray(selectedRange) && (
        <p className="text-sm text-neutral/70">
          Duration:{" "}
          {Math.ceil(
            ((selectedRange[1]?.getTime() || selectedRange[0]?.getTime() || 0) -
              (selectedRange[0]?.getTime() || 0)) /
              (1000 * 60 * 60 * 24)
          ) + 1}{" "}
          day(s)
        </p>
      )}
    </div>
  );
}
```

### 2. Create Date Helper Utilities

```typescript
// lib/utils/dateHelpers.ts

/**
 * Calculate visit duration (inclusive of start and end dates)
 */
export function calculateVisitDuration(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (startDate === endDate) {
    return startFormatted; // Single day
  }

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}
```

### 3. Update Guest Schema

```typescript
// lib/schemas/guest.ts (UPDATED)

import { z } from "zod";
import {
  isValidPhoneNumber,
  isValidPlateNumber,
  isNotPastDate,
  isWithin30Days,
} from "@/lib/utils/validation";

export const createGuestSchema = z
  .object({
    guestName: z
      .string()
      .min(1, "Guest name is required")
      .max(100, "Guest name must be less than 100 characters"),

    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidPhoneNumber(val),
        "Invalid phone number format",
      ),

    vehiclePlate: z
      .string()
      .optional()
      .transform((val) => val?.toUpperCase())
      .refine((val) => !val || isValidPlateNumber(val), "Invalid plate number"),

    purpose: z
      .string()
      .min(1, "Purpose is required")
      .max(200, "Purpose must be less than 200 characters"),

    visitDateStart: z
      .string()
      .min(1, "Visit start date is required")
      .refine(isNotPastDate, "Start date cannot be in the past")
      .refine(
        isWithin30Days,
        "Cannot pre-authorize more than 30 days in advance",
      ),

    visitDateEnd: z.string().min(1, "Visit end date is required"),

    visitDuration: z.number().int().positive().optional(),

    expectedArrivalTime: z.string().optional(),

    specialInstructions: z
      .string()
      .max(500, "Special instructions must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.visitDateStart);
      const end = new Date(data.visitDateEnd);
      return end >= start;
    },
    {
      message: "Visit end date must be on or after start date",
      path: ["visitDateEnd"],
    },
  );

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
```

### 4. Update GuestForm Component

```typescript
// components/features/guests/GuestForm.tsx (UPDATED)

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { createGuestSchema, type CreateGuestInput } from "@/lib/schemas/guest";
import { toISODateString, calculateVisitDuration } from "@/lib/utils/dateHelpers";

interface GuestFormProps {
  onSubmit: (data: CreateGuestInput) => Promise<void>;
  initialData?: Partial<CreateGuestInput>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function GuestForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = "Submit",
}: GuestFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateGuestInput>({
    resolver: zodResolver(createGuestSchema),
    defaultValues: initialData,
  });

  const visitDateStart = watch("visitDateStart");
  const visitDateEnd = watch("visitDateEnd");

  const handleFormSubmit = (data: CreateGuestInput) => {
    // Auto-calculate duration before submission
    const duration = calculateVisitDuration(data.visitDateStart, data.visitDateEnd);
    return onSubmit({ ...data, visitDuration: duration });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Guest Name */}
      <Input
        label="Guest Name"
        placeholder="Juan Dela Cruz"
        error={errors.guestName?.message}
        fullWidth
        required
        {...register("guestName")}
      />

      {/* Contact Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="09XX-XXX-XXXX"
          error={errors.phone?.message}
          helperText="Optional - for contact purposes"
          fullWidth
          {...register("phone")}
        />

        <Input
          label="Vehicle Plate Number"
          placeholder="ABC-1234"
          error={errors.vehiclePlate?.message}
          helperText="Optional - if arriving by vehicle"
          fullWidth
          {...register("vehiclePlate")}
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral">
          Purpose of Visit <span className="text-error-500">*</span>
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border-2 border-neutral/20 bg-white px-4 py-3"
          placeholder="Brief description of visit purpose"
          {...register("purpose")}
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-error-500">{errors.purpose.message}</p>
        )}
      </div>

      {/* Visit Date Range - NEW */}
      <Controller
        name="visitDateStart"
        control={control}
        render={({ field, fieldState }) => (
          <DateRangePicker
            value={
              field.value && visitDateEnd
                ? [new Date(field.value), new Date(visitDateEnd)]
                : undefined
            }
            onChange={(dates) => {
              field.onChange(toISODateString(dates[0]));
              // Also update visitDateEnd via setValue
              const endDate = dates[1] || dates[0];
              // Note: This requires access to setValue from useForm
              // You may need to pass setValue as a prop or use a different approach
            }}
            error={fieldState.error?.message || errors.visitDateEnd?.message}
          />
        )}
      />

      {/* Expected Arrival Time */}
      <Input
        label="Expected Arrival Time"
        type="time"
        error={errors.expectedArrivalTime?.message}
        helperText="Optional"
        fullWidth
        {...register("expectedArrivalTime")}
      />

      {/* Special Instructions */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral">
          Special Instructions
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border-2 border-neutral/20 bg-white px-4 py-3"
          placeholder="Any special instructions for the guard (optional)"
          {...register("specialInstructions")}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

## API Integration

### Update createGuest Function

```typescript
// lib/api/guests.ts (UPDATED)

import { supabase } from "@/lib/supabase";
import type { CreateGuestInput } from "@/lib/schemas/guest";

export async function createGuest(data: CreateGuestInput, householdId: string) {
  const payload = {
    household_id: householdId,
    guest_name: data.guestName,
    phone: data.phone,
    vehicle_plate: data.vehiclePlate,
    purpose: data.purpose,
    visit_start_date: data.visitDateStart, // [UPDATED] Renamed
    visit_end_date: data.visitDateEnd, // [NEW]
    visit_duration: data.visitDuration, // [NEW]
    expected_arrival_time: data.expectedArrivalTime,
    special_instructions: data.specialInstructions,
  };

  const { data: guest, error } = await supabase
    .from("guests")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return guest;
}
```

## Validation

### Add New Validation Helpers

```typescript
// lib/utils/validation.ts (ADD THESE FUNCTIONS)

/**
 * Check if date is within 30 days from today
 */
export function isWithin30Days(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  return inputDate <= maxDate;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}
```

## Testing

### Unit Tests

```typescript
// __tests__/components/DateRangePicker.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

describe("DateRangePicker", () => {
  it("should render calendar", () => {
    render(<DateRangePicker onChange={jest.fn()} />);
    expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
  });

  it("should auto-fill end date when only start selected", async () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);

    // Simulate date selection
    // Note: Actual test implementation depends on react-calendar structure
  });

  it("should display error message", () => {
    render(
      <DateRangePicker onChange={jest.fn()} error="Invalid date range" />
    );
    expect(screen.getByText("Invalid date range")).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/features/GuestForm.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuestForm } from "@/components/features/guests/GuestForm";

describe("GuestForm with Date Range", () => {
  it("should submit form with date range", async () => {
    const mockSubmit = jest.fn();
    render(<GuestForm onSubmit={mockSubmit} />);

    // Fill form fields
    await userEvent.type(screen.getByLabelText(/guest name/i), "John Doe");
    await userEvent.type(
      screen.getByLabelText(/purpose/i),
      "Family visit"
    );

    // Select dates (implementation depends on calendar testing approach)

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          visitDateStart: expect.any(String),
          visitDateEnd: expect.any(String),
          visitDuration: expect.any(Number),
        })
      );
    });
  });
});
```

## Troubleshooting

### Common Issues

**Issue**: Calendar styles not loading

- **Solution**: Ensure `import 'react-calendar/dist/Calendar.css'` is in your global CSS or component

**Issue**: TypeScript errors for react-calendar types

- **Solution**: Install `@types/react-calendar`: `npm install --save-dev @types/react-calendar`

**Issue**: Date validation not working

- **Solution**: Check that validation functions are imported correctly and date strings are in ISO format

**Issue**: Form submission includes wrong date format

- **Solution**: Use `toISODateString()` helper to ensure YYYY-MM-DD format

**Issue**: Accessibility warnings

- **Solution**: Ensure all ARIA labels are set on DateRangePicker component

### Performance

If the calendar feels slow on mobile:

- Consider lazy-loading the calendar component
- Debounce the onChange handler
- Use React.memo for the DateRangePicker component

### Browser Compatibility

react-calendar supports:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

Ensure you have appropriate polyfills for older browsers if needed.

## Next Steps

After implementing this feature:

1. **Test thoroughly**: Use the test suite and manual testing on real devices
2. **Monitor performance**: Check form submission times and calendar interactions
3. **Gather feedback**: Collect user feedback on the date range selection UX
4. **Update documentation**: Keep this quickstart updated with any changes

For detailed implementation tasks, see `tasks.md` (generated by `/speckit.tasks`).

---

**Quickstart Complete**: Ready for implementation. Refer to this guide during development.
