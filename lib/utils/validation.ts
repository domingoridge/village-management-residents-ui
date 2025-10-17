/**
 * Utility functions for validation
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Philippine mobile number
 * Accepts formats: 09XX-XXX-XXXX, 09XXXXXXXXX, +639XXXXXXXXX
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's 11 digits starting with 09
  if (/^09\d{9}$/.test(cleaned)) return true;

  // Check if it's 12 digits starting with 639
  if (/^639\d{9}$/.test(cleaned)) return true;

  return false;
}

/**
 * Validate vehicle plate number (Philippine format)
 * Accepts: ABC1234, ABC-1234, 123ABC, 123-ABC
 */
export function isValidPlateNumber(plate: string): boolean {
  const cleaned = plate.replace(/[-\s]/g, "").toUpperCase();

  // Common Philippine plate formats
  const formats = [
    /^[A-Z]{3}\d{4}$/, // ABC1234
    /^\d{3}[A-Z]{3}$/, // 123ABC
    /^[A-Z]{2}\d{4}$/, // AB1234
    /^\d{4}[A-Z]{2}$/, // 1234AB
  ];

  return formats.some((regex) => regex.test(cleaned));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file type by extension
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[],
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

/**
 * Validate date is not in the past
 */
export function isNotPastDate(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj >= today;
}

/**
 * Validate date is within range
 */
export function isDateInRange(
  date: string | Date,
  minDate: string | Date,
  maxDate: string | Date,
): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const minDateObj = typeof minDate === "string" ? new Date(minDate) : minDate;
  const maxDateObj = typeof maxDate === "string" ? new Date(maxDate) : maxDate;

  return dateObj >= minDateObj && dateObj <= maxDateObj;
}

/**
 * Validate password strength
 * Returns object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Check if date is within 30 days from today
 */
export function isWithin30Days(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  return inputDate <= maxDate;
}

/**
 * Validate date range (end date must be >= start date)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}
