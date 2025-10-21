/**
 * PermitWizard Component
 *
 * Single-step permit application form.
 * Dynamically renders form fields from JSON schema and submits directly.
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StepProjectDetails } from "./StepProjectDetails";
import { Button } from "@/components/ui/Button";
import { usePermitForm } from "@/lib/hooks/usePermitForm";
import { useDynamicSchema } from "@/lib/hooks/useDynamicSchema";
import {
  useSubmitPermit,
  useCreatePermit,
  useUpdatePermit,
} from "@/lib/hooks/usePermits";
import type { PermitType } from "@/constants/permitTypes";
import type { PermitApplication } from "@/types/permit";

interface PermitWizardProps {
  permitApplication?: PermitApplication;
}

/**
 * PermitWizard Component
 *
 * Single-step permit application form.
 * All form fields are rendered dynamically from JSON schema and submitted directly.
 *
 * @example
 * ```tsx
 * // New application
 * <PermitWizard />
 *
 * // Resume draft
 * <PermitWizard permitApplication={draftApplication} />
 * ```
 */
export function PermitWizard({ permitApplication }: PermitWizardProps) {
  const router = useRouter();
  const [permitType, setPermitType] = useState<PermitType | null>(
    permitApplication?.permitType || null,
  );
  const [applicationId, setApplicationId] = useState<string | undefined>(
    permitApplication?.id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks for permit operations
  const createPermitMutation = useCreatePermit();
  const updatePermitMutation = useUpdatePermit();
  const submitPermitMutation = useSubmitPermit();

  // Load schema for selected permit type
  const { schema } = useDynamicSchema(permitType);

  // Memoize defaultValues to prevent infinite re-renders
  const defaultValues = useMemo(
    () => permitApplication?.formAnswers || {},
    [permitApplication?.formAnswers],
  );

  // Initialize form with react-hook-form and Zod validation
  const { form, isValid, isDirty, handleSubmit } = usePermitForm({
    schema,
    defaultValues,
    onSubmit: async (data) => {
      await handleFormSubmit(data);
    },
  });

  /**
   * Handle form submission and direct permit submission
   */
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);

    try {
      if (!permitType) {
        throw new Error("Please select a permit type");
      }

      let permitId = applicationId;

      // Create or update permit
      if (applicationId) {
        // Update existing draft
        await updatePermitMutation.mutateAsync({
          id: applicationId,
          projectDetails: data,
          status: "submitted",
        });
      } else {
        // Create new permit and submit
        const newApplication = await createPermitMutation.mutateAsync({
          permitType,
          projectDetails: data,
          status: "submitted",
        });
        permitId = newApplication.id;
        setApplicationId(newApplication.id);
      }

      // Submit the permit
      if (permitId) {
        await submitPermitMutation.mutateAsync(permitId);

        // Redirect to confirmation page
        router.push(`/permits/${permitId}/confirmation`);
      }
    } catch (error) {
      console.error("Error submitting permit:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit permit application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle "Save as Draft" button
   */
  const handleSaveDraft = async () => {
    setIsSubmitting(true);

    try {
      if (!permitType) {
        throw new Error("Please select a permit type");
      }

      const formData = form.getValues();

      if (applicationId) {
        // Update existing draft
        await updatePermitMutation.mutateAsync({
          id: applicationId,
          projectDetails: formData,
          status: "draft",
        });
      } else {
        // Create new draft
        const newApplication = await createPermitMutation.mutateAsync({
          permitType,
          projectDetails: formData,
          status: "draft",
        });
        setApplicationId(newApplication.id);
      }

      alert("Draft saved successfully!");
      router.push("/permits");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save draft. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl" data-testid="permit-wizard">
      {/* Application Form */}
      <div className="mb-8 rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
        <StepProjectDetails
          form={form}
          permitType={permitType}
          onPermitTypeChange={setPermitType}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        {/* Save as Draft Button */}
        {isDirty && (
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={isSubmitting || !permitType}
            data-testid="wizard-save-draft-button"
          >
            Save as Draft
          </Button>
        )}

        {/* Submit Button */}
        <Button
          variant="primary"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={!permitType || !isValid || isSubmitting}
          isLoading={isSubmitting}
          data-testid="wizard-submit-button"
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}
