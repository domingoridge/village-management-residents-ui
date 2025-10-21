/**
 * Fee Service
 *
 * Service for retrieving and managing permit fees.
 */

import {
  calculateTotalFees,
  type CalculatedFees,
} from "@/lib/utils/feeCalculator";
import type { PermitType } from "@/constants/permitTypes";

export interface GetFeesInput {
  permitType: PermitType;
  projectDetails?: Record<string, unknown>;
}

/**
 * Get calculated fees for a permit application
 *
 * In a real implementation, this might call a backend API to get dynamic fees
 * For now, it uses the client-side calculator
 */
export async function getFees(input: GetFeesInput): Promise<CalculatedFees> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const fees = calculateTotalFees(input.permitType, input.projectDetails);
  return fees;
}

/**
 * Record payment for a permit application
 */
export async function recordPayment(
  applicationId: string,
  paymentMethod: string,
  amount: number,
): Promise<{ success: boolean; transactionId?: string }> {
  // This would integrate with a real payment gateway
  // For now, just simulate success
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
  };
}
