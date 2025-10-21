/**
 * EmptySection Component
 *
 * Displays an empty state message when a section has no filled fields.
 * Used by SectionRenderer when all fields in a section are empty.
 */

import React from "react";

interface EmptySectionProps {
  /** Section title to display in the empty state */
  sectionTitle?: string;
  /** Optional custom message to display */
  message?: string;
  /** Optional data-testid for testing */
  dataTestId?: string;
}

/**
 * Empty state component for sections with no data
 *
 * @example
 * ```tsx
 * <EmptySection
 *   sectionTitle="Project Information"
 *   message="No project details have been provided yet."
 * />
 * ```
 */
export function EmptySection({
  sectionTitle,
  message = "No information provided",
  dataTestId = "empty-section",
}: EmptySectionProps) {
  return (
    <div
      className="rounded-lg border-2 border-dashed border-neutral/20 bg-neutral/5 p-6 text-center"
      data-testid={dataTestId}
    >
      <div className="mx-auto max-w-md">
        {sectionTitle && (
          <h3
            className="mb-2 text-sm font-medium text-neutral/70"
            data-testid={`${dataTestId}-title`}
          >
            {sectionTitle}
          </h3>
        )}
        <p
          className="text-sm text-neutral/50"
          data-testid={`${dataTestId}-message`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
