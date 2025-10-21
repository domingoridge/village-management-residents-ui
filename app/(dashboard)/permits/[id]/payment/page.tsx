/**
 * Permit Payment Page
 *
 * Dedicated page for processing payment for approved permit applications.
 * Displays fee breakdown and payment method selection.
 */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePermit } from "@/lib/hooks/usePermits";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { PERMIT_TYPES } from "@/constants/permitTypes";
import { StepPayment } from "@/components/features/permits/StepPayment";
import type { PaymentMethod } from "@/types/payment";

export default function PermitPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: application, isLoading: loading } = usePermit(id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSubmit = async () => {
    if (!paymentMethod || !application) return;

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // TODO: Implement actual payment gateway integration
      // For now, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate payment success
      alert(
        `Payment submitted!\nMethod: ${paymentMethod}\nAmount: ₱${application ? "5,000.00" : "0.00"}\n\nRedirecting to confirmation...`,
      );

      // Navigate to confirmation or back to permit details
      router.push(`/permits/${id}`);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Payment processing failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-neutral/20" />
            <div className="h-96 w-full rounded-lg bg-neutral/10" />
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

  // Check if permit is approved
  if (application.status !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-neutral">
            Payment Not Available
          </h1>
          <p className="mt-2 text-neutral/70">
            This permit application is not approved for payment yet.
          </p>
          <p className="mt-1 text-sm text-neutral/50">
            Current status:{" "}
            <span className="font-medium capitalize">
              {application.status.replace("_", " ")}
            </span>
          </p>
          <Button
            onClick={() => router.push(`/permits/${id}`)}
            className="mt-4"
          >
            Back to Application Details
          </Button>
        </div>
      </div>
    );
  }

  const permitMetadata = PERMIT_TYPES[application.permitType];

  return (
    <div className="container mx-auto px-4 py-8" data-testid="payment-page">
      <div className="mx-auto max-w-4xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/permits/${id}`)}
            className="mb-4"
            data-testid="back-to-permit-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Permit Details
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-neutral">
              Payment for {permitMetadata.displayName}
            </h1>
            <p className="mt-2 text-neutral/70">
              Complete your payment to proceed with your permit application
            </p>
            <p className="mt-1 text-sm text-neutral/50">
              Application ID:{" "}
              <span className="font-mono font-medium">{application.id}</span>
            </p>
          </div>
        </div>

        {/* Payment Component */}
        <div className="space-y-6">
          <StepPayment
            permitType={application.permitType}
            projectDetails={application.formAnswers}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            error={paymentError || undefined}
          />

          {/* Payment Actions */}
          <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/permits/${id}`)}
                fullWidth
                disabled={isSubmitting}
                data-testid="cancel-payment-button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePaymentSubmit}
                disabled={!paymentMethod || isSubmitting}
                fullWidth
                data-testid="submit-payment-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Payment
                  </>
                )}
              </Button>
            </div>

            {paymentMethod && !isSubmitting && (
              <div className="mt-4 rounded-lg bg-primary-500/5 p-3">
                <p className="text-sm text-neutral/70">
                  By clicking Submit Payment, you will be redirected to{" "}
                  <span className="font-medium text-neutral">
                    {
                      {
                        gcash: "GCash",
                        paymaya: "PayMaya",
                        credit_card: "the payment gateway",
                        pay_at_office: "confirm your payment at the office",
                      }[paymentMethod]
                    }
                  </span>{" "}
                  to complete your transaction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
