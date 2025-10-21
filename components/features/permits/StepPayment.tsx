/**
 * StepPayment Component
 *
 * Step 3 of permit wizard: Review fees and select payment method.
 */

"use client";

import { FeeBreakdownCard } from "./FeeBreakdownCard";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { useFeeCalculation } from "@/lib/hooks/useFeeCalculation";
import type { PermitType } from "@/constants/permitTypes";
import type { PaymentMethod } from "@/types/payment";

interface StepPaymentProps {
  permitType: PermitType;
  projectDetails: Record<string, unknown>;
  paymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod | null) => void;
  error?: string;
}

/**
 * StepPayment Component
 *
 * Displays fee breakdown and payment method selection.
 *
 * @example
 * ```tsx
 * const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
 *
 * <StepPayment
 *   permitType="construction"
 *   projectDetails={formData}
 *   paymentMethod={paymentMethod}
 *   onPaymentMethodChange={setPaymentMethod}
 * />
 * ```
 */
export function StepPayment({
  permitType,
  projectDetails,
  paymentMethod,
  onPaymentMethodChange,
  error,
}: StepPaymentProps) {
  const { fees, isCalculating } = useFeeCalculation({
    permitType,
    projectDetails,
  });

  return (
    <div className="space-y-6" data-testid="step-payment">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral">Payment</h2>
        <p className="mt-1 text-sm text-neutral/70">
          Review the permit fees and select your payment method
        </p>
      </div>

      {/* Fee Breakdown */}
      <FeeBreakdownCard fees={fees} isLoading={isCalculating} />

      {/* Payment Method Selection */}
      <div className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm">
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={onPaymentMethodChange}
          disabled={isCalculating || !fees}
        />

        {error && (
          <div
            className="mt-4 rounded-lg border-2 border-error-500/20 bg-error-500/5 p-3"
            role="alert"
          >
            <p className="text-sm text-error-500">{error}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-4">
        <h4 className="mb-2 text-sm font-semibold text-neutral">
          Application Summary
        </h4>
        <ul className="space-y-1 text-sm text-neutral/70">
          <li>
            Permit Type:{" "}
            <span className="font-medium text-neutral">{permitType}</span>
          </li>
          <li>
            Total Amount:{" "}
            <span className="font-medium text-primary-500">
              {fees
                ? `₱${fees.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                : "-"}
            </span>
          </li>
          <li>
            Payment Method:{" "}
            <span className="font-medium text-neutral">
              {paymentMethod
                ? paymentMethod.replace("_", " ").toUpperCase()
                : "Not selected"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
