/**
 * Field Formatter Utility
 *
 * Transforms formAnswers values for display with proper formatting.
 * Handles dates, enums, numbers with units, and text fields.
 */

import type { FieldType } from "@/types/forms";

/**
 * Format date using Intl.DateTimeFormat for Philippine locale
 *
 * @param dateString - ISO date string (e.g., "2025-01-15")
 * @param locale - Locale to use for formatting (defaults to "en-PH")
 * @returns Formatted date string (e.g., "January 15, 2025")
 *
 * @example
 * formatDate("2025-01-15") // "January 15, 2025"
 * formatDate("2025-01-15", "en-US") // "January 15, 2025"
 */
export function formatDate(dateString: string, locale = "en-PH"): string {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    // Return original string if formatting fails
    return dateString;
  }
}

/**
 * Convert enum key to display label
 *
 * Handles underscores and capitalizes properly for human-readable display.
 *
 * @param value - Enum key (e.g., "interior", "move_out")
 * @returns Display label (e.g., "Interior", "Move Out")
 *
 * @example
 * formatEnumValue("interior") // "Interior"
 * formatEnumValue("move_out") // "Move Out"
 * formatEnumValue("gate_pass") // "Gate Pass"
 */
export function formatEnumValue(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format number with optional unit and Philippine locale
 *
 * @param value - Number value to format
 * @param unit - Optional unit to append (e.g., "sq meters", "kg", "PHP")
 * @param locale - Locale to use for formatting (defaults to "en-PH")
 * @returns Formatted number with unit (e.g., "50 sq meters", "1,234.56 kg")
 *
 * @example
 * formatNumberWithUnit(50, "sq meters") // "50 sq meters"
 * formatNumberWithUnit(1234.56) // "1,234.56"
 * formatNumberWithUnit(1000.5, "PHP") // "1,000.5 PHP"
 */
export function formatNumberWithUnit(
  value: number,
  unit?: string,
  locale = "en-PH",
): string {
  if (typeof value !== "number" || isNaN(value)) {
    return String(value);
  }

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const formattedNumber = formatter.format(value);

  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
}

/**
 * Format text value, preserving whitespace for textarea fields
 *
 * @param value - Text value to format
 * @param fieldType - Type of field (determines if whitespace should be preserved)
 * @returns Formatted text with proper whitespace handling
 *
 * @example
 * formatTextValue("Hello\nWorld", "textarea") // Preserves line breaks
 * formatTextValue("  Hello  ", "text") // Trims whitespace
 */
export function formatTextValue(value: string, fieldType: FieldType): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // For textarea fields, preserve whitespace and line breaks
  if (fieldType === "textarea") {
    return value;
  }

  // For other text fields, trim excess whitespace
  return value.trim();
}

/**
 * Metadata interface for field formatting
 */
export interface FieldMetadata {
  unit?: string;
  locale?: string;
  [key: string]: unknown;
}

/**
 * Main formatter that delegates to specific formatters based on field type
 *
 * @param value - Value to format (any type)
 * @param fieldType - Type of field (determines formatting strategy)
 * @param metadata - Optional metadata containing unit, locale, etc.
 * @returns Formatted value as string
 *
 * @example
 * formatFieldValue("2025-01-15", "date") // "January 15, 2025"
 * formatFieldValue("interior", "select") // "Interior"
 * formatFieldValue(50, "number", { unit: "sq meters" }) // "50 sq meters"
 * formatFieldValue("Hello\nWorld", "textarea") // Preserves line breaks
 */
export function formatFieldValue(
  value: unknown,
  fieldType: FieldType,
  metadata?: FieldMetadata,
): string {
  // Handle null or undefined values
  if (value == null) {
    return "";
  }

  const locale = metadata?.locale || "en-PH";

  switch (fieldType) {
    case "date":
      return formatDate(String(value), locale);

    case "select":
      // Assume select fields contain enum values
      return formatEnumValue(String(value));

    case "number":
      // Convert to number if it's a string
      const numValue = typeof value === "number" ? value : Number(value);
      return formatNumberWithUnit(numValue, metadata?.unit, locale);

    case "textarea":
      return formatTextValue(String(value), "textarea");

    case "text":
    case "email":
    case "tel":
      return formatTextValue(String(value), fieldType);

    case "file":
      // For file fields, return the filename or path
      return String(value);

    default:
      // Default: return string representation
      return String(value);
  }
}

/**
 * Format multiple field values from formAnswers object
 *
 * @param formAnswers - Object containing field values
 * @param fieldTypes - Map of field names to their types
 * @param metadata - Optional map of field names to their metadata
 * @returns Object with formatted values
 *
 * @example
 * formatFormAnswers(
 *   { startDate: "2025-01-15", area: 50, type: "interior" },
 *   { startDate: "date", area: "number", type: "select" },
 *   { area: { unit: "sq meters" } }
 * )
 * // {
 * //   startDate: "January 15, 2025",
 * //   area: "50 sq meters",
 * //   type: "Interior"
 * // }
 */
export function formatFormAnswers(
  formAnswers: Record<string, unknown>,
  fieldTypes: Record<string, FieldType>,
  metadata?: Record<string, FieldMetadata>,
): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [fieldName, value] of Object.entries(formAnswers)) {
    const fieldType = fieldTypes[fieldName];
    const fieldMetadata = metadata?.[fieldName];

    if (fieldType) {
      formatted[fieldName] = formatFieldValue(value, fieldType, fieldMetadata);
    } else {
      // If no field type is specified, return string representation
      formatted[fieldName] = String(value ?? "");
    }
  }

  return formatted;
}
