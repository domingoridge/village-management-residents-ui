import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MIN_VEHICLE_YEAR,
  MAX_PLATE_NUMBER_LENGTH,
  MAX_VEHICLES_PER_REQUEST,
} from "@/constants/stickers";

// File validation helper
const createFileSchema = (
  acceptedTypes: readonly string[],
  maxSize: number,
  fieldName: string,
) =>
  z
    .instanceof(File, { message: `${fieldName} is required` })
    .refine((file) => file.size <= maxSize, {
      message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    })
    .refine((file) => acceptedTypes.includes(file.type), {
      message: `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`,
    });

// Optional file schema
const createOptionalFileSchema = (
  acceptedTypes: readonly string[],
  maxSize: number,
  fieldName: string,
) =>
  z
    .instanceof(File, { message: `${fieldName} must be a file` })
    .refine((file) => file.size <= maxSize, {
      message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    })
    .refine((file) => acceptedTypes.includes(file.type), {
      message: `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`,
    })
    .optional();

// Single vehicle form schema
export const vehicleFormSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .max(
      MAX_PLATE_NUMBER_LENGTH,
      `Maximum ${MAX_PLATE_NUMBER_LENGTH} characters`,
    )
    .trim(),
  residentId: z.string().min(1, "Please select a resident"),
  holderName: z.string().min(1, "Holder name is required"),
  make: z.string().min(1, "Vehicle make is required").max(50).trim(),
  model: z.string().min(1, "Vehicle model is required").max(50).trim(),
  color: z.string().max(30).trim().optional(),
  year: z
    .number({
      invalid_type_error: "Year must be a number",
    })
    .int("Year must be a whole number")
    .min(MIN_VEHICLE_YEAR, `Year must be ${MIN_VEHICLE_YEAR} or later`)
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  registeredTo: z.string().max(100).trim().optional(),
  stickerType: z.literal("resident"),
  officialReceipt: createFileSchema(
    ACCEPTED_DOCUMENT_TYPES,
    MAX_FILE_SIZE,
    "Official Receipt",
  ),
  certRegistration: createFileSchema(
    ACCEPTED_DOCUMENT_TYPES,
    MAX_FILE_SIZE,
    "Certificate of Registration",
  ),
  vehiclePhoto: createOptionalFileSchema(
    ACCEPTED_IMAGE_TYPES,
    MAX_FILE_SIZE,
    "Vehicle Photo",
  ),
});

// Full form schema with array validation
export const stickerRequestFormSchema = z.object({
  vehicles: z
    .array(vehicleFormSchema)
    .min(1, "At least one vehicle is required")
    .max(
      MAX_VEHICLES_PER_REQUEST,
      `Maximum ${MAX_VEHICLES_PER_REQUEST} vehicles per submission`,
    ),
});

// Type inference
export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
export type StickerRequestFormData = z.infer<typeof stickerRequestFormSchema>;
