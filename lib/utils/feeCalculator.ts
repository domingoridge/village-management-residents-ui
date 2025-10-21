/**
 * Fee Calculator Utilities
 *
 * Calculates permit fees based on permit type and project parameters.
 */

import { FEE_STRUCTURES, type CalculatedFees } from "@/constants/feeStructures";
import type { PermitType } from "@/constants/permitTypes";

/**
 * Calculate base fee for a permit type
 */
export function calculateBaseFee(permitType: PermitType): number {
  const feeStructure = FEE_STRUCTURES[permitType];
  return feeStructure.baseFee;
}

/**
 * Calculate processing fee for a permit type
 */
export function calculateProcessingFee(permitType: PermitType): number {
  const feeStructure = FEE_STRUCTURES[permitType];
  return feeStructure.processingFee;
}

/**
 * Calculate road use fee (only for construction/renovation)
 */
export function calculateRoadUseFee(permitType: PermitType): number {
  const feeStructure = FEE_STRUCTURES[permitType];
  return feeStructure.roadUseFee || 0;
}

/**
 * Calculate total fees for a permit application
 */
export function calculateTotalFees(
  permitType: PermitType,
  projectDetails?: Record<string, unknown>,
): CalculatedFees {
  const baseFee = calculateBaseFee(permitType);
  const processingFee = calculateProcessingFee(permitType);
  const roadUseFee = calculateRoadUseFee(permitType);

  // Additional calculations based on project details (if applicable)
  let additionalFees = 0;

  // Example: For construction, add fee based on floor area
  if (permitType === "construction" && projectDetails?.totalFloorArea) {
    const floorArea = projectDetails.totalFloorArea as number;
    // Additional PHP 10 per square meter for large projects (>500 sqm)
    if (floorArea > 500) {
      additionalFees = (floorArea - 500) * 10;
    }
  }

  // Example: For renovation, add fee based on affected area
  if (permitType === "renovation" && projectDetails?.affectedArea) {
    const affectedArea = projectDetails.affectedArea as number;
    // Additional PHP 5 per square meter for large renovations (>200 sqm)
    if (affectedArea > 200) {
      additionalFees = (affectedArea - 200) * 5;
    }
  }

  const subtotal = baseFee + processingFee + roadUseFee + additionalFees;
  const total = subtotal;

  const breakdown = [
    { label: "Base Fee", amount: baseFee },
    { label: "Processing Fee", amount: processingFee },
  ];

  if (roadUseFee > 0) {
    breakdown.push({ label: "Road Use Fee", amount: roadUseFee });
  }

  if (additionalFees > 0) {
    breakdown.push({ label: "Additional Fees", amount: additionalFees });
  }

  return {
    baseFee,
    processingFee,
    roadUseFee,
    subtotal,
    total,
    breakdown,
  };
}

/**
 * Format currency amount to Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
