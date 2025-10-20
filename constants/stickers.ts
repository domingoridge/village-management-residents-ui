// File upload limits and types
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

// Human-readable file type labels
export const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
} as const;

// Routes for sticker requests
export const STICKER_ROUTES = {
  NEW: "/stickers/new",
  LIST: "/stickers",
  DETAIL: (id: string) => `/stickers/${id}`,
} as const;

// Validation constants
export const MIN_VEHICLE_YEAR = 1900;
export const MAX_PLATE_NUMBER_LENGTH = 15;
export const MAX_VEHICLES_PER_REQUEST = 10;

// Sticker type labels
export const STICKER_TYPE_LABELS = {
  resident: "Resident (Vehicle Owner)",
  beneficial_user: "Beneficial User (Authorized User)",
} as const;

// Status labels
export const STATUS_LABELS = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "neutral",
} as const;
