/**
 * File Validation Utilities
 *
 * Functions for validating file uploads (size, format, etc.)
 */

import {
  MAX_FILE_SIZE,
  type DocumentType,
  ALLOWED_FILE_FORMATS,
} from "@/constants/fileFormats";

export interface FileValidationError {
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_FORMAT"
    | "INVALID_MIME_TYPE"
    | "UNKNOWN_ERROR";
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(
  file: File,
  maxSize: number = MAX_FILE_SIZE,
): FileValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File size (${formatBytes(file.size)}) exceeds maximum allowed size of ${formatBytes(maxSize)}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validate file format based on document type
 */
export function validateFileFormat(
  file: File,
  documentType: DocumentType,
): FileValidationResult {
  const config = ALLOWED_FILE_FORMATS[documentType];

  if (!config) {
    return {
      valid: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Unknown document type",
      },
    };
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: "INVALID_MIME_TYPE",
        message: `File type "${file.type}" is not allowed. Accepted formats: ${config.allowedFormats.join(", ")}`,
      },
    };
  }

  // Check file extension
  const extension = file.name.split(".").pop()?.toUpperCase();
  if (!extension || !config.allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: {
        code: "INVALID_FORMAT",
        message: `File format ".${extension}" is not allowed. Accepted formats: ${config.allowedFormats.join(", ")}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation combining size and format checks
 */
export function validateFile(
  file: File,
  documentType: DocumentType,
  maxSize?: number,
): FileValidationResult {
  // Validate size
  const sizeResult = validateFileSize(file, maxSize);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  // Validate format
  const formatResult = validateFileFormat(file, documentType);
  if (!formatResult.valid) {
    return formatResult;
  }

  return { valid: true };
}

/**
 * Format file size in human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
