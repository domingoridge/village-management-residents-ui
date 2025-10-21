/**
 * SectionRenderer Component
 *
 * Renders a single section with title and fields, organized by schema structure.
 * Used to display permit application data in a structured, readable format.
 *
 * @module components/features/permits/SectionRenderer
 */

import type { SectionMetadata, FieldValue } from "@/types/schema";
import { FieldRenderer } from "./FieldRenderer";

/**
 * Props for the SectionRenderer component
 */
interface SectionRendererProps {
  /**
   * Section metadata containing title, fields, and ordering information
   */
  section: SectionMetadata;

  /**
   * Form answers data object containing field values
   * Keys should match field keys in the section
   */
  formAnswers: Record<string, FieldValue>;
}

/**
 * Renders a section with its title and fields in a responsive grid layout.
 *
 * Features:
 * - Displays section title with proper styling
 * - Renders fields in a responsive grid (1 column mobile, 2 columns desktop)
 * - Sorts fields by their order property
 * - Skips fields that don't have values in formAnswers
 * - Uses FieldRenderer for individual field rendering
 * - Matches existing UI design patterns
 *
 * Layout:
 * - Mobile (320px+): 1 column grid
 * - Desktop (1024px+): 2 column grid
 *
 * @param props - Component props
 * @returns Rendered section or null if no fields have values
 *
 * @example
 * ```tsx
 * <SectionRenderer
 *   section={{
 *     key: "projectInfo",
 *     title: "Project Information",
 *     order: 1,
 *     fields: [
 *       { key: "projectStartDate", title: "Project Start Date", fieldType: "date", order: 1, required: true },
 *       { key: "projectEndDate", title: "Project End Date", fieldType: "date", order: 2, required: true }
 *     ]
 *   }}
 *   formAnswers={{
 *     projectStartDate: "2025-01-15",
 *     projectEndDate: "2025-03-15"
 *   }}
 * />
 * ```
 */
export function SectionRenderer({
  section,
  formAnswers,
}: SectionRendererProps) {
  // Sort fields by their order property
  const sortedFields = [...section.fields].sort((a, b) => a.order - b.order);

  // Access the section data from the nested formAnswers structure
  const sectionData = formAnswers[section.key];

  // Ensure sectionData is an object before accessing fields
  if (!sectionData || typeof sectionData !== "object") {
    return null;
  }

  // Filter fields that have values in the section data
  const fieldsWithValues = sortedFields.filter((field) => {
    const value = (sectionData as Record<string, FieldValue>)[field.key];
    return value != null && value !== "";
  });

  // Skip rendering if no fields have values
  if (fieldsWithValues.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm"
      data-testid={`section-${section.key}`}
    >
      {/* Section Title */}
      <h2
        className="mb-4 text-lg font-semibold text-neutral"
        data-testid={`section-title-${section.key}`}
      >
        {section.title}
      </h2>

      {/* Optional Section Description */}
      {section.description && (
        <p
          className="mb-4 text-sm text-neutral/70"
          data-testid={`section-description-${section.key}`}
        >
          {section.description}
        </p>
      )}

      {/* Fields Grid - Responsive Layout */}
      <dl
        className="grid gap-4 sm:grid-cols-2"
        data-testid={`section-fields-${section.key}`}
      >
        {fieldsWithValues.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={(sectionData as Record<string, FieldValue>)[field.key]}
          />
        ))}
      </dl>
    </div>
  );
}
