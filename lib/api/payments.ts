/**
 * Payment API client functions
 *
 * Handles permit payment operations.
 */

import { createClient } from "@/lib/supabase/browser";
import { useAuthStore } from "@/store/auth";
import type { PaymentMethod } from "@/types/payment";

export interface CreatePermitPaymentInput {
  permitId: string;
  paymentMethod: PaymentMethod;
  amount?: number;
  paymentMetadata?: Record<string, unknown>;
}

export interface PermitPayment {
  id: string;
  permitId: string;
  tenantId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  receiptNumber: string;
  receiptUrl: string | null;
  paymentDate: string;
  paymentMetadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Generate unique receipt number
 */
function generateReceiptNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7).toUpperCase();
  return `PERMIT-${timestamp}-${random}`;
}

/**
 * Transform database record to PermitPayment type
 */
function transformPaymentFromDb(data: Record<string, unknown>): PermitPayment {
  return {
    id: data.id as string,
    permitId: data.permit_id as string,
    tenantId: data.tenant_id as string,
    amount: data.amount as number,
    paymentMethod: data.payment_method as PaymentMethod,
    collectedBy: data.collected_by as string,
    receiptNumber: data.receipt_number as string,
    receiptUrl: data.receipt_url as string | null,
    paymentDate: data.payment_date as string,
    paymentMetadata: data.payment_metadata as Record<string, unknown> | null,
    createdAt: data.created_at as string,
  };
}

/**
 * Create a permit payment record
 */
export async function createPermitPayment(
  input: CreatePermitPaymentInput,
): Promise<PermitPayment> {
  const supabase = createClient();
  const { tenantUser } = useAuthStore.getState();

  if (!tenantUser) {
    throw new Error("User not authenticated");
  }

  const receiptNumber = generateReceiptNumber();

  const { data, error } = await supabase
    .from("permit_payment")
    .insert({
      permit_id: input.permitId,
      tenant_id: tenantUser.tenantId,
      amount: input.amount ?? 0, // Default to 0, admin will update later
      payment_method: input.paymentMethod,
      collected_by: tenantUser.id,
      receipt_number: receiptNumber,
      payment_date: new Date().toISOString(),
      payment_metadata: input.paymentMetadata ?? {
        payment_method: input.paymentMethod,
        submitted_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment record: ${error.message}`);
  }

  return transformPaymentFromDb(data);
}

/**
 * Get payment record by permit ID
 */
export async function fetchPaymentByPermitId(
  permitId: string,
): Promise<PermitPayment | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("permit_payment")
    .select("*")
    .eq("permit_id", permitId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }

  return transformPaymentFromDb(data);
}
