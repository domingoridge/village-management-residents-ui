/**
 * Utility functions for formatting data
 */

/**
 * Format date to localized string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj?.toLocaleDateString("en-PH", options);
}

/**
 * Format date to short string (MM/DD/YYYY)
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format time to localized string
 */
export function formatTime(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-PH", options);
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDay) >= 1) {
    return rtf.format(diffDay, "day");
  } else if (Math.abs(diffHour) >= 1) {
    return rtf.format(diffHour, "hour");
  } else if (Math.abs(diffMin) >= 1) {
    return rtf.format(diffMin, "minute");
  } else {
    return rtf.format(diffSec, "second");
  }
}

/**
 * Format currency (Philippine Peso)
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    ...options,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(
  num: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat("en-PH", options).format(num);
}

/**
 * Format phone number (Philippine format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Match Philippine mobile number format (09XX-XXX-XXXX)
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // Return original if no match
  return phone;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format initials from name
 */
export function formatInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format enum values to human-readable labels
 */
export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
