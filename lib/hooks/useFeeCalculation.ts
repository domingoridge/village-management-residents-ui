/**
 * useFeeCalculation Hook
 *
 * Calculates and manages permit fees with real-time updates.
 */

import { useState, useEffect } from "react";
import {
  calculateTotalFees,
  type CalculatedFees,
} from "@/lib/utils/feeCalculator";
import type { PermitType } from "@/constants/permitTypes";

interface UseFeeCalculationOptions {
  permitType: PermitType | null;
  projectDetails?: Record<string, unknown>;
}

interface UseFeeCalculationReturn {
  fees: CalculatedFees | null;
  isCalculating: boolean;
  recalculate: () => void;
}

/**
 * Hook to calculate permit fees based on permit type and project details
 *
 * @example
 * ```tsx
 * const { fees, isCalculating } = useFeeCalculation({
 *   permitType: 'construction',
 *   projectDetails: { totalFloorArea: 600 },
 * });
 *
 * if (fees) {
 *   console.log('Total:', formatCurrency(fees.total));
 * }
 * ```
 */
export function useFeeCalculation({
  permitType,
  projectDetails,
}: UseFeeCalculationOptions): UseFeeCalculationReturn {
  const [fees, setFees] = useState<CalculatedFees | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const recalculate = () => {
    if (!permitType) {
      setFees(null);
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay (< 1 second as per requirements)
    setTimeout(() => {
      const calculatedFees = calculateTotalFees(permitType, projectDetails);
      setFees(calculatedFees);
      setIsCalculating(false);
    }, 300); // 300ms delay for smooth UX
  };

  // Recalculate when permit type or project details change
  useEffect(() => {
    recalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permitType, JSON.stringify(projectDetails)]);

  return {
    fees,
    isCalculating,
    recalculate,
  };
}
