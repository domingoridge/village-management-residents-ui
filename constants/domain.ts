/**
 * Domain constants and business rules
 */

// Guest pre-authorization
export const GUEST = {
  MAX_ADVANCE_DAYS: 30, // Maximum days in advance to pre-authorize
  MAX_ACTIVE_GUESTS: 10, // Maximum active guest pre-authorizations per household
} as const;

// Vehicle stickers
export const STICKER = {
  DEFAULT_QUOTA: 3, // Default sticker quota per household
  VALIDITY_YEARS: 1, // Sticker validity in years
  RENEWAL_NOTICE_DAYS: 30, // Days before expiry to show renewal notice
  ALLOWED_DOCUMENT_TYPES: [
    "or",
    "cr",
    "insurance",
    "drivers_license",
    "deed_of_sale",
    "other",
  ] as const,
  MAX_DOCUMENT_SIZE_MB: 5, // Maximum file size for documents in MB
} as const;

// Payments
export const PAYMENT = {
  OVERDUE_GRACE_DAYS: 7, // Days after due date before marked as overdue
  PAYMENT_METHODS: ["gcash", "paymaya", "card", "bank_transfer"] as const,
} as const;

// Permits
export const PERMIT = {
  MAX_DURATION_DAYS: 365, // Maximum permit duration in days
  ROAD_FEE_AMOUNT: 500, // Default road fee amount in PHP
  ALLOWED_DOCUMENT_TYPES: ["pdf", "jpg", "jpeg", "png"] as const,
  MAX_DOCUMENT_SIZE_MB: 10,
} as const;

// Incidents
export const INCIDENT = {
  MAX_PHOTO_COUNT: 5, // Maximum photos per incident
  MAX_PHOTO_SIZE_MB: 5,
  ALLOWED_PHOTO_TYPES: ["jpg", "jpeg", "png", "webp"] as const,
} as const;

// Messages
export const MESSAGE = {
  MAX_ATTACHMENT_COUNT: 3,
  MAX_ATTACHMENT_SIZE_MB: 5,
  ALLOWED_ATTACHMENT_TYPES: [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "doc",
    "docx",
  ] as const,
} as const;

// Announcements
export const ANNOUNCEMENT = {
  MAX_ATTACHMENT_COUNT: 5,
  MAX_ATTACHMENT_SIZE_MB: 10,
  ALLOWED_ATTACHMENT_TYPES: [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "doc",
    "docx",
  ] as const,
} as const;

// File uploads
export const FILE_UPLOAD = {
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ] as const,
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_DOCUMENT_SIZE_MB: 10,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
} as const;

// Date/Time formats
export const DATE_FORMAT = {
  DISPLAY: "MMMM d, yyyy", // For display in UI
  SHORT: "MM/dd/yyyy", // For compact display
  TIME: "h:mm a", // 12-hour format
  DATETIME: "MMMM d, yyyy h:mm a",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", // ISO 8601
} as const;

// Notification settings
export const NOTIFICATION = {
  AUTO_DISMISS_SECONDS: 5,
  MAX_VISIBLE: 3,
  PRIORITY_COLORS: {
    critical: "#ef4444",
    high: "#f97316",
    normal: "#3b82f6",
    low: "#6b7280",
  },
} as const;

// UI constants
export const UI = {
  MOBILE_BREAKPOINT: 768, // px
  TABLET_BREAKPOINT: 1024, // px
  DESKTOP_BREAKPOINT: 1280, // px
  SIDEBAR_WIDTH: 256, // px
  HEADER_HEIGHT: 64, // px
  TOUCH_TARGET_MIN_SIZE: 44, // px (WCAG 2.1 AA)
} as const;

// Validation patterns
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(09|\+639)\d{9}$/,
  PLATE_NUMBER_REGEX: /^[A-Z0-9-]{6,8}$/,
  PASSWORD_MIN_LENGTH: 8,
} as const;

// Status colors (for badges, chips, etc.)
export const STATUS_COLORS = {
  // Guest statuses
  guest: {
    pending: "warning",
    approved: "success",
    at_gate: "info",
    denied: "error",
    completed: "neutral",
  },
  // Payment statuses
  payment: {
    pending: "warning",
    paid: "success",
    overdue: "error",
    failed: "error",
  },
  // Permit statuses
  permit: {
    draft: "neutral",
    submitted: "info",
    pending_payment: "warning",
    approved: "success",
    rejected: "error",
    in_progress: "info",
    completed: "success",
    cancelled: "neutral",
  },
  // Incident statuses
  incident: {
    reported: "warning",
    acknowledged: "info",
    in_progress: "info",
    resolved: "success",
    closed: "neutral",
  },
  // Sticker statuses
  sticker: {
    active: "success",
    expired: "error",
    revoked: "error",
    pending_renewal: "warning",
  },
} as const;
