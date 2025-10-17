/**
 * Date range type for the calendar component
 */
export type DateRange = [Date | null, Date | null];

/**
 * Formatted date range for display
 */
export interface FormattedDateRange {
  startDate: string; // Human-readable: "Dec 20, 2025"
  endDate: string; // Human-readable: "Dec 27, 2025"
  duration: number; // Number of days
  rangeText: string; // Combined: "Dec 20-27, 2025" or "Dec 20, 2025" for single day
}
