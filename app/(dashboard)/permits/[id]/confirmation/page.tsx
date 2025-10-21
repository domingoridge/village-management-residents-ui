/**
 * Permit Confirmation Page
 *
 * Displays confirmation after successful permit application submission.
 */

"use client";

import { useRouter, useParams } from "next/navigation";
import { usePermit } from "@/lib/hooks/usePermits";
import { Button } from "@/components/ui/Button";
import { CheckCircle, FileText, Calendar, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils/feeCalculator";
import { useFeeCalculation } from "@/lib/hooks/useFeeCalculation";

export default function PermitConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: application, isLoading: loading } = usePermit(id);

  const { fees } = useFeeCalculation({
    permitType: application?.permitType || null,
    projectDetails: application?.formAnswers,
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-neutral/20" />
            <div className="h-32 w-full rounded-lg bg-neutral/10" />
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
            View All Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-8"
      data-testid="confirmation-page"
    >
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
            <CheckCircle className="h-10 w-10 text-success-500" />
          </div>
          <h1 className="text-3xl font-bold text-neutral">
            Application Submitted Successfully!
          </h1>
          <p className="mt-2 text-neutral/70">
            Your permit application has been received and is being processed
          </p>
        </div>

        {/* Application Details Card */}
        <div className="space-y-6">
          {/* Reference Number */}
          <div className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-6">
            <h3 className="mb-2 text-sm font-medium text-neutral/70">
              Reference Number
            </h3>
            <p
              className="text-2xl font-bold text-primary-500"
              data-testid="reference-number"
            >
              {application.id}
            </p>
          </div>

          {/* Application Summary */}
          <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral">
              <FileText className="h-5 w-5" />
              Application Summary
            </h3>

            <dl className="space-y-3">
              <div className="flex justify-between border-b border-neutral/10 pb-3">
                <dt className="text-sm text-neutral/70">Permit Type</dt>
                <dd className="text-sm font-medium text-neutral">
                  {application.permitType.replace("_", " ").toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral/10 pb-3">
                <dt className="text-sm text-neutral/70">Status</dt>
                <dd className="text-sm font-medium text-primary-500">
                  {application.status.replace("_", " ").toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral/10 pb-3">
                <dt className="text-sm text-neutral/70">Submitted Date</dt>
                <dd className="text-sm font-medium text-neutral">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString(
                        "en-PH",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "-"}
                </dd>
              </div>
              {fees && (
                <div className="flex justify-between pt-3">
                  <dt className="text-sm font-semibold text-neutral">
                    Initial Total Amount to pay
                  </dt>
                  <dd className="text-lg font-bold text-primary-500">
                    {formatCurrency(fees.total)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral">
              <Calendar className="h-5 w-5" />
              Next Steps
            </h3>

            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  1
                </span>
                <p className="text-sm text-neutral">
                  Your application will be reviewed by our team within{" "}
                  <strong>3-5 business days</strong>.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  2
                </span>
                <p className="text-sm text-neutral">
                  You will receive a notification when your application status
                  changes.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  3
                </span>
                <p className="text-sm text-neutral">
                  Once approved, you can proceed with payment
                </p>
              </li>
            </ol>
          </div>

          {/* Payment Notice */}
          <div className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-4">
            <div className="flex gap-3">
              <CreditCard className="h-5 w-5 flex-shrink-0 text-primary-500" />
              <div>
                <h4 className="text-sm font-semibold text-neutral">
                  Payment Information
                </h4>
                <p className="mt-1 text-sm text-neutral/70">
                  Payment can be completed online or at the village office.
                  Please keep your reference number for tracking purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              onClick={() => router.push("/permits")}
              fullWidth
              data-testid="view-applications-button"
            >
              View My Applications
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/permits/new")}
              fullWidth
              data-testid="new-application-button"
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
