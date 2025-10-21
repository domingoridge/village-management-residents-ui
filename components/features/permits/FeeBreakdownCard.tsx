/**
 * FeeBreakdownCard Component
 *
 * Displays itemized fee breakdown for permit applications.
 */

"use client";

import { formatCurrency, type CalculatedFees } from "@/lib/utils/feeCalculator";

interface FeeBreakdownCardProps {
  fees: CalculatedFees | null;
  isLoading?: boolean;
}

/**
 * Skeleton loader for fee breakdown
 */
function FeeBreakdownSkeleton() {
  return (
    <div className="space-y-3" data-testid="fee-breakdown-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral/20" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral/20" />
        </div>
      ))}
    </div>
  );
}

/**
 * FeeBreakdownCard Component
 *
 * Shows detailed fee breakdown with total in Philippine Peso format.
 *
 * @example
 * ```tsx
 * const { fees, isCalculating } = useFeeCalculation({
 *   permitType: 'construction',
 *   projectDetails,
 * });
 *
 * <FeeBreakdownCard fees={fees} isLoading={isCalculating} />
 * ```
 */
export function FeeBreakdownCard({
  fees,
  isLoading = false,
}: FeeBreakdownCardProps) {
  if (isLoading) {
    return (
      <div
        className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm"
        data-testid="fee-breakdown-card"
      >
        <h3 className="mb-4 text-lg font-semibold text-neutral">
          Fee Breakdown
        </h3>
        <FeeBreakdownSkeleton />
      </div>
    );
  }

  if (!fees) {
    return (
      <div
        className="rounded-lg border-2 border-dashed border-neutral/20 bg-neutral/5 p-6 text-center"
        data-testid="fee-breakdown-card"
      >
        <p className="text-sm text-neutral/70">
          Complete the previous steps to view fee breakdown
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border-2 border-neutral/10 bg-white p-6 shadow-sm"
      data-testid="fee-breakdown-card"
    >
      <h3 className="mb-4 text-lg font-semibold text-neutral">Fee Breakdown</h3>

      {/* Itemized Fees */}
      <div className="space-y-3 border-b-2 border-neutral/10 pb-4">
        {fees.breakdown.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
            data-testid={`fee-item-${index}`}
          >
            <span className="text-neutral/70">{item.label}</span>
            <span className="font-medium text-neutral">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral">Total Amount</span>
        <span
          className="text-2xl font-bold text-primary-500"
          data-testid="fee-total"
        >
          {formatCurrency(fees.total)}
        </span>
      </div>

      {/* Additional Info */}
      <div className="mt-4 rounded-lg bg-primary-500/5 p-3">
        <p className="text-xs text-neutral/70">
          All fees are in Philippine Peso (₱). Payment must be completed before
          permit approval.
        </p>
      </div>
    </div>
  );
}
