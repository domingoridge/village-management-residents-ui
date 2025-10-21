/**
 * PaymentMethodSelector Component
 *
 * Allows users to select payment method (GCash, PayMaya, Credit Card, Pay Later).
 */

"use client";

import { PAYMENT_METHODS, type PaymentMethod } from "@/types/payment";
import { CreditCard, Wallet, Clock } from "lucide-react";

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod | null) => void;
  disabled?: boolean;
}

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  gcash: <Wallet className="h-5 w-5" />,
  paymaya: <Wallet className="h-5 w-5" />,
  credit_card: <CreditCard className="h-5 w-5" />,
  pay_at_office: <Clock className="h-5 w-5" />,
};

/**
 * PaymentMethodSelector Component
 *
 * Card-based selector for payment methods with visual icons.
 *
 * @example
 * ```tsx
 * const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
 *
 * <PaymentMethodSelector
 *   value={paymentMethod}
 *   onChange={setPaymentMethod}
 * />
 * ```
 */
export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const methods = Object.values(PAYMENT_METHODS).filter(
    (method) => method.enabled,
  );

  return (
    <div className="space-y-3" data-testid="payment-method-selector">
      <label className="text-sm font-medium text-neutral">
        Payment Method
        <span className="ml-1 text-error-500">*</span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const isSelected = value === method.method;

          return (
            <button
              key={method.method}
              type="button"
              onClick={() => onChange(method.method)}
              disabled={disabled}
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all
                ${
                  isSelected
                    ? "border-primary-500 bg-primary-500/5 ring-2 ring-primary-500/20"
                    : "border-neutral/20 bg-white hover:border-primary-500/50"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              `}
              data-testid={`payment-method-${method.method}`}
            >
              {/* Icon */}
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-lg
                  ${isSelected ? "bg-primary-500 text-white" : "bg-neutral/10 text-neutral"}
                `}
              >
                {PAYMENT_METHOD_ICONS[method.method]}
              </div>

              {/* Method Info */}
              <div className="flex-1">
                <p className="font-medium text-neutral">{method.displayName}</p>
                {method.method === "pay_at_office" && (
                  <p className="text-xs text-neutral/70">
                    Pay at the admin office
                  </p>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-primary-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pay Later Notice */}
      {value === "pay_at_office" && (
        <div className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-3">
          <p className="text-sm text-neutral">
            <strong>Note:</strong> Your application will be marked as
            &ldquo;Pending Payment&rdquo;. Please visit the village office to
            complete payment before your permit can be processed.
          </p>
        </div>
      )}

      {/* Online Payment Notice */}
      {value && value !== "pay_at_office" && (
        <div className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-3">
          <p className="text-sm text-neutral">
            You will be redirected to the payment gateway to complete your
            transaction securely.
          </p>
        </div>
      )}
    </div>
  );
}
