/**
 * StepProjectDetails Component
 *
 * Step 1 of permit wizard: Select permit type and fill project details.
 * Integrates PermitTypeSelector and DynamicFormRenderer.
 */

"use client";

import { useState, useEffect } from "react";
import { type UseFormReturn, type FieldValues } from "react-hook-form";
import { PermitTypeSelector } from "./PermitTypeSelector";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import { useDynamicSchema } from "@/lib/hooks/useDynamicSchema";
import type { PermitType } from "@/constants/permitTypes";

interface StepProjectDetailsProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  permitType: PermitType | null;
  onPermitTypeChange: (permitType: PermitType | null) => void;
}

/**
 * Skeleton loader component for form fields
 */
function FormSkeleton() {
  return (
    <div className="space-y-4" data-testid="form-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral/20" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-neutral/10" />
        </div>
      ))}
    </div>
  );
}

/**
 * StepProjectDetails Component
 *
 * Renders permit type selector and dynamically loaded form fields based on selected type.
 *
 * @example
 * ```tsx
 * const form = useForm();
 * const [permitType, setPermitType] = useState<PermitType | null>(null);
 *
 * <StepProjectDetails
 *   form={form}
 *   permitType={permitType}
 *   onPermitTypeChange={setPermitType}
 * />
 * ```
 */
export function StepProjectDetails<T extends FieldValues = FieldValues>({
  form,
  permitType,
  onPermitTypeChange,
}: StepProjectDetailsProps<T>) {
  const { schema, loading, error } = useDynamicSchema(permitType);
  const [showForm, setShowForm] = useState(false);

  // Show form only after schema is loaded and not in loading state
  useEffect(() => {
    if (!loading && schema && permitType) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowForm(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowForm(false);
    }
  }, [loading, schema, permitType]);

  // Get permit type selection error from form
  const permitTypeError = form.formState.errors.permitType?.message as
    | string
    | undefined;

  return (
    <div className="space-y-6" data-testid="step-project-details">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral">Project Details</h2>
        <p className="mt-1 text-sm text-neutral/70">
          Select your permit type and provide project information
        </p>
      </div>

      {/* Permit Type Selector */}
      <PermitTypeSelector
        value={permitType}
        onChange={onPermitTypeChange}
        error={permitTypeError}
        required
      />

      {/* Dynamic Form Fields */}
      {permitType && (
        <div className="border-t-2 border-neutral/10 pt-6">
          {loading && <FormSkeleton />}

          {error && (
            <div
              className="rounded-lg border-2 border-error-500/20 bg-error-500/5 p-4"
              role="alert"
              data-testid="schema-error"
            >
              <h4 className="mb-1 text-sm font-semibold text-error-500">
                Failed to load form
              </h4>
              <p className="text-sm text-error-500/70">{error.message}</p>
            </div>
          )}

          {!loading && !error && schema && showForm && (
            <div data-testid="project-details-form">
              <h3 className="mb-4 text-lg font-semibold text-neutral">
                {schema.title}
              </h3>
              {schema.description && (
                <p className="mb-6 text-sm text-neutral/70">
                  {schema.description}
                </p>
              )}
              <DynamicFormRenderer schema={schema} form={form} />
            </div>
          )}
        </div>
      )}

      {!permitType && (
        <div className="rounded-lg border-2 border-dashed border-neutral/20 bg-neutral/5 p-8 text-center">
          <p className="text-sm text-neutral/70">
            Please select a permit type to view and fill out the application
            form
          </p>
        </div>
      )}
    </div>
  );
}
