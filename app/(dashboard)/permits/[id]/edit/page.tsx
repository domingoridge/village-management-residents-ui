/**
 * Edit Permit Draft Page
 *
 * Allows users to resume editing a draft permit application.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { usePermit } from "@/lib/hooks/usePermits";
import { PermitWizard } from "@/components/features/permits/PermitWizard";

export default function EditPermitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: application,
    isLoading: loading,
    error: queryError,
  } = usePermit(id);

  // Check if application is a draft
  const error =
    application && application.status !== "draft"
      ? "Only draft applications can be edited"
      : queryError
        ? (queryError as Error).message
        : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-64 rounded bg-neutral/20" />
            <div className="mt-2 h-4 w-96 rounded bg-neutral/10" />
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-neutral/10" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-neutral">
            {error || "Application Not Found"}
          </h1>
          <p className="mt-2 text-neutral/70">
            {error ||
              "The permit application could not be found or cannot be edited."}
          </p>
          <button
            onClick={() => router.push("/permits")}
            className="mt-4 rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-600"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral">
          Edit Draft Application
        </h1>
        <p className="mt-2 text-neutral/70">
          Resume editing your {application.permitType} permit application
        </p>
      </div>

      <PermitWizard permitApplication={application} />
    </div>
  );
}
