"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import type { Value } from "react-calendar";
import "react-calendar/dist/Calendar.css";

/**
 * DateRangePicker Component
 *
 * A WCAG 2.1 AA compliant date range picker for selecting visit dates.
 *
 * Keyboard Navigation:
 * - Arrow keys: Navigate between dates
 * - Enter/Space: Select a date
 * - Tab: Move between calendar controls and navigation buttons
 * - Page Up/Down: Navigate between months
 * - Home/End: Navigate to start/end of week
 *
 * Accessibility Features:
 * - Full ARIA label support for screen readers
 * - Live region announcements for date selection
 * - 44x44px touch targets for mobile accessibility
 * - High contrast focus indicators
 *
 * Auto-fill Behavior:
 * - When a single date is selected, the end date automatically fills with the same date
 * - Enables quick entry for single-day visits
 */

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

  // Calculate duration
  const calculateDuration = (): number | null => {
    if (!selectedRange || !Array.isArray(selectedRange)) return null;
    const start = selectedRange[0];
    const end = selectedRange[1] || selectedRange[0];
    if (!start || !end) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end day
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultMaxDate = new Date(today);
  defaultMaxDate.setDate(today.getDate() + 30);

  const duration = calculateDuration();

  return (
    <div className="space-y-2" data-testid="date-range-picker">
      <div>
        <label className="block text-sm font-medium text-neutral dark:text-neutral-200">
          Visit Date(s)
          <span className="text-error-500 dark:text-error-400">*</span>
        </label>
        <p className="mt-1 text-xs text-neutral/60 dark:text-neutral-400">
          Select start and end dates for the visit
        </p>
      </div>

      <Calendar
        value={selectedRange}
        onChange={handleChange}
        selectRange
        minDate={minDate || today}
        maxDate={maxDate || defaultMaxDate}
        disabled={disabled}
        className="!w-full rounded-lg border-2 border-neutral/20 dark:border-neutral-700 shadow-sm dark:bg-neutral-800"
        tileClassName={({ view }) => {
          if (view === "month") {
            // Ensure 44x44px touch targets with proper styling
            return "min-h-[44px] min-w-[44px] hover:bg-primary-100 dark:hover:bg-primary-900 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 rounded-md transition-colors";
          }
          return "";
        }}
        // WCAG 2.1 AA Accessibility features
        navigationAriaLabel="Navigate calendar months"
        nextAriaLabel="Next month"
        prevAriaLabel="Previous month"
        next2AriaLabel="Jump forward one year"
        prev2AriaLabel="Jump back one year"
        navigationAriaLive="polite"
      />

      {/* Accessibility: Announce selected dates */}
      {selectedRange && Array.isArray(selectedRange) && selectedRange[0] && (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Selected dates: {selectedRange[0]?.toLocaleDateString()} to{" "}
          {(selectedRange[1] || selectedRange[0])?.toLocaleDateString()}
        </div>
      )}

      {/* Error message display */}
      {error && (
        <p className="text-sm text-error-500 dark:text-error-400" role="alert">
          {error}
        </p>
      )}

      {/* Display calculated visit duration */}
      {duration !== null && (
        <p className="text-sm text-neutral/70 dark:text-neutral-400">
          Duration: {duration} day{duration !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
