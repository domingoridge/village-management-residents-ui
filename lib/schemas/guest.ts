import { z } from "zod";
import {
  isValidPhoneNumber,
  isValidPlateNumber,
  isNotPastDate,
  isWithin30Days,
} from "@/lib/utils/validation";

/**
 * Guest pre-authorization validation schemas
 */

// Base guest schema for creation
export const createGuestSchema = z
  .object({
    guestName: z
      .string()
      .min(1, "Guest name is required")
      .max(100, "Guest name must be less than 100 characters"),

    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidPhoneNumber(val),
        "Invalid phone number format (use 09XX-XXX-XXXX or +639XXXXXXXXX)",
      ),

    vehiclePlate: z
      .string()
      .optional()
      .transform((val) => val?.toUpperCase())
      .refine(
        (val) => !val || isValidPlateNumber(val),
        "Invalid plate number format",
      ),

    purpose: z
      .string()
      .min(1, "Purpose is required")
      .max(200, "Purpose must be less than 200 characters"),

    visitDateStart: z
      .string()
      .min(1, "Visit start date is required")
      .refine(isNotPastDate, "Start date cannot be in the past")
      .refine(
        isWithin30Days,
        "Cannot pre-authorize more than 30 days in advance",
      ),

    visitDateEnd: z.string().min(1, "Visit end date is required"),

    visitDuration: z.number().int().positive().optional(),

    expectedArrivalTime: z.string().optional(),

    specialInstructions: z
      .string()
      .max(500, "Special instructions must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // End date must be >= start date
      const start = new Date(data.visitDateStart);
      const end = new Date(data.visitDateEnd);
      return end >= start;
    },
    {
      message: "Visit end date must be on or after start date",
      path: ["visitDateEnd"],
    },
  );

// Update guest schema (only allow updating certain fields)
export const updateGuestSchema = createGuestSchema.partial();

// Guest status transition schema
export const updateGuestStatusSchema = z.object({
  status: z.enum(["approved", "at_gate", "denied", "completed"]),
  notes: z.string().optional(),
});

// Guest filter schema for list queries
export const guestFilterSchema = z.object({
  status: z
    .enum(["pending", "approved", "at_gate", "denied", "completed"])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

// Type exports
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type UpdateGuestStatusInput = z.infer<typeof updateGuestStatusSchema>;
export type GuestFilterParams = z.infer<typeof guestFilterSchema>;
