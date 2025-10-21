/**
 * Fee Structures for Permit Applications
 *
 * Defines base fees, processing fees, and additional charges per permit type.
 */

import type { PermitType } from "./permitTypes";

export interface FeeStructure {
  baseFee: number;
  processingFee: number;
  roadUseFee?: number;
  description: string;
}

export interface CalculatedFees {
  baseFee: number;
  processingFee: number;
  roadUseFee: number;
  subtotal: number;
  total: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

/**
 * Base fee structures per permit type (in Philippine Pesos)
 */
export const FEE_STRUCTURES: Record<PermitType, FeeStructure> = {
  construction: {
    baseFee: 5000,
    processingFee: 1000,
    roadUseFee: 500,
    description: "Construction permit base fee",
  },
  renovation: {
    baseFee: 3000,
    processingFee: 800,
    roadUseFee: 300,
    description: "Renovation permit base fee",
  },
  electrical: {
    baseFee: 2000,
    processingFee: 500,
    description: "Electrical permit base fee",
  },
  plumbing: {
    baseFee: 2000,
    processingFee: 500,
    description: "Plumbing permit base fee",
  },
};

/**
 * Processing fee percentage (applied to base fee)
 */
export const PROCESSING_FEE_PERCENTAGE = 0.2; // 20%

/**
 * Road use fee (flat rate for construction/renovation)
 */
export const ROAD_USE_FEE = 500; // PHP 500

/**
 * Minimum processing fee
 */
export const MIN_PROCESSING_FEE = 500; // PHP 500
