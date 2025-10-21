/**
 * FieldRenderer Component
 *
 * Renders individual form fields with proper formatting based on field type.
 * This component is responsible for displaying field labels and values with
 * appropriate formatting for different field types (date, select, number, textarea, etc.).
 *
 * @module components/features/permits/FieldRenderer
 */

import { formatFieldValue } from "@/lib/utils/fieldFormatter";
import type { FieldMetadata, FieldValue } from "@/types/schema";

/**
 * Props for the FieldRenderer component
 */
interface FieldRendererProps {
  /**
   * Field metadata containing label, type, and formatting information
   */
  field: FieldMetadata;

  /**
   * The value to display for this field
   */
  value: FieldValue;
}

/**
 * Renders a single form field with label and formatted value.
 *
 * Features:
 * - Formats values based on field type (date, select, number, textarea, text, email, tel)
 * - Skips rendering if value is null, undefined, or empty string
 * - Preserves whitespace and line breaks for textarea fields
 * - Applies proper styling matching existing UI patterns
 * - Optionally displays helper text if provided
 *
 * Field type formatting:
 * - date: "January 15, 2025"
 * - select/enum: "Interior" (capitalized)
 * - number: "50 sq meters" (with unit)
 * - textarea: Preserves line breaks and whitespace
 * - text/email/tel: Display as-is (trimmed)
 *
 * @param props - Component props
 * @returns Formatted field display or null if value is empty
 *
 * @example
 * ```tsx
 * <FieldRenderer
 *   field={{
 *     key: "projectStartDate",
 *     title: "Project Start Date",
 *     fieldType: "date",
 *     order: 1,
 *     required: true,
 *     helperText: "When construction will begin"
 *   }}
 *   value="2025-01-15"
 * />
 * // Renders:
 * // <div>
 * //   <dt>Project Start Date</dt>
 * //   <dd>January 15, 2025</dd>
 * //   <dd class="helper">When construction will begin</dd>
 * // </div>
 * ```
 */
export function FieldRenderer({ field, value }: FieldRendererProps) {
  // Skip rendering if value is null, undefined, or empty string
  if (value == null || value === "") {
    return null;
  }

  // Format the value based on field type
  const formattedValue = formatFieldValue(value, field.fieldType, {
    unit: field.unit,
  });

  // Skip rendering if formatted value is empty
  if (!formattedValue) {
    return null;
  }

  return (
    <div data-testid={`field-${field.key}`}>
      <dt
        className="text-sm font-medium capitalize text-neutral/70"
        data-testid={`field-label-${field.key}`}
      >
        {field.title}
      </dt>
      <dd
        className={`mt-1 text-sm text-neutral ${
          field.fieldType === "textarea" ? "whitespace-pre-wrap" : ""
        }`}
        data-testid={`field-value-${field.key}`}
      >
        {formattedValue}
      </dd>
      {field.helperText && (
        <dd
          className="mt-1 text-xs text-neutral/50"
          data-testid={`field-helper-${field.key}`}
        >
          {field.helperText}
        </dd>
      )}
    </div>
  );
}
