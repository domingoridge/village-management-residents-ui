/**
 * Payment Types
 *
 * Type definitions for payment processing and fee calculations.
 */

export type PaymentMethod =
  | "gcash"
  | "paymaya"
  | "credit_card"
  | "pay_at_office";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface FeeBreakdown {
  baseFee: number;
  processingFee: number;
  roadUseFee: number;
  total: number;
  currency: "PHP";
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  gatewayTransactionId?: string;
  paidAt?: string; // ISO 8601 datetime string
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  method: PaymentMethod;
  displayName: string;
  icon: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentGatewayConfig> = {
  gcash: {
    method: "gcash",
    displayName: "GCash",
    icon: "wallet",
    enabled: true,
  },
  paymaya: {
    method: "paymaya",
    displayName: "PayMaya",
    icon: "credit-card",
    enabled: true,
  },
  credit_card: {
    method: "credit_card",
    displayName: "Credit/Debit Card",
    icon: "credit-card",
    enabled: true,
  },
  pay_at_office: {
    method: "pay_at_office",
    displayName: "Pay at Office",
    icon: "clock",
    enabled: true,
  },
};
