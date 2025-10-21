/**
 * View Permit Application Page
 *
 * Displays details of a submitted permit application.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { usePermit } from "@/lib/hooks/usePermits";
import { Button } from "@/components/ui/Button";
import { FileText, Calendar, CreditCard } from "lucide-react";
import { PERMIT_TYPES } from "@/constants/permitTypes";
import { formatCurrency } from "@/lib/utils/feeCalculator";
import { useFeeCalculation } from "@/lib/hooks/useFeeCalculation";
import { useSchemaMetadata } from "@/lib/hooks/useSchemaMetadata";
import { SectionRenderer } from "@/components/features/permits/SectionRenderer";

export default function ViewPermitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: application, isLoading: loading } = usePermit(id);

  const { fees } = useFeeCalculation({
    permitType: application?.permitType || null,
    projectDetails: application?.formAnswers,
  });

  const { schemaMetadata, loading: schemaLoading } = useSchemaMetadata(
    application?.permitType || null,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-neutral/10 text-neutral";
      case "submitted":
        return "bg-primary-500/10 text-primary-500";
      case "under_review":
        return "bg-accent-500/10 text-accent-500";
      case "approved":
        return "bg-success-500/10 text-success-500";
      case "rejected":
        return "bg-error-500/10 text-error-500";
      case "pending_payment":
        return "bg-accent-500/10 text-accent-500";
      default:
        return "bg-neutral/10 text-neutral";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-neutral/20" />
            <div className="h-64 w-full rounded-lg bg-neutral/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-neutral">
            Application Not Found
          </h1>
          <p className="mt-2 text-neutral/70">
            The permit application could not be found.
          </p>
          <Button onClick={() => router.push("/permits")} className="mt-4">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const permitMetadata = PERMIT_TYPES[application.permitType];

  return (
    <div className="container mx-auto px-4 py-8" data-testid="view-permit-page">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral">
              {permitMetadata.displayName}
            </h1>
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${getStatusColor(application.status)}`}
            >
              {application.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="text-neutral/70">{permitMetadata.description}</p>
        </div>

        <div className="space-y-6">
          {/* Application Info */}
          <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral">
              <FileText className="h-5 w-5" />
              Application Information
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-neutral/70">
                  Reference Number
                </dt>
                <dd className="mt-1 font-mono text-sm font-medium text-neutral">
                  {application.permitNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral/70">
                  Permit Type
                </dt>
                <dd className="mt-1 text-sm text-neutral">
                  {permitMetadata.displayName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral/70">
                  Created Date
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-neutral">
                  <Calendar className="h-4 w-4" />
                  {new Date(application.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              {application.submittedAt && (
                <div>
                  <dt className="text-sm font-medium text-neutral/70">
                    Submitted Date
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-neutral">
                    <Calendar className="h-4 w-4" />
                    {new Date(application.submittedAt).toLocaleDateString(
                      "en-PH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Project Details - Dynamically rendered by schema sections */}
          {schemaMetadata &&
            application.formAnswers &&
            Object.keys(application.formAnswers).length > 0 && (
              <>
                {schemaMetadata.sections.map((section) => (
                  <SectionRenderer
                    key={section.key}
                    section={section}
                    formAnswers={application.formAnswers}
                  />
                ))}
              </>
            )}

          {/* Loading state for schema */}
          {schemaLoading && (
            <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 rounded bg-neutral/20" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-16 rounded bg-neutral/10" />
                  <div className="h-16 rounded bg-neutral/10" />
                  <div className="h-16 rounded bg-neutral/10" />
                  <div className="h-16 rounded bg-neutral/10" />
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral">
                <FileText className="h-5 w-5" />
                Uploaded Documents
              </h2>

              <ul className="space-y-2">
                {application.documents.map((doc, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral/10 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-neutral/70" />
                      <span className="text-sm text-neutral">{doc.name}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-500 hover:underline"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fees */}
          {fees && (
            <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-neutral">
                Fee Breakdown
              </h2>

              <dl className="space-y-2">
                {fees.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <dt className="text-neutral/70">{item.label}</dt>
                    <dd className="font-medium text-neutral">
                      {formatCurrency(item.amount)}
                    </dd>
                  </div>
                ))}
                <div className="border-t-2 border-neutral/10 pt-2">
                  <div className="flex justify-between">
                    <dt className="text-lg font-semibold text-neutral">
                      Total
                    </dt>
                    <dd className="text-xl font-bold text-primary-500">
                      {formatCurrency(fees.total)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/permits")}
              fullWidth
            >
              Back to Applications
            </Button>
            {application.status === "approved" && (
              <Button
                variant="primary"
                onClick={() =>
                  router.push(`/permits/${application.id}/payment`)
                }
                fullWidth
                data-testid="proceed-payment-button"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed with Payment
              </Button>
            )}
            {application.status === "draft" && (
              <Button
                variant="primary"
                onClick={() => router.push(`/permits/${application.id}/edit`)}
                fullWidth
              >
                Resume Draft
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
