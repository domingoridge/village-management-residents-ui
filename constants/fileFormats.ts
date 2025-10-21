/**
 * File Format Constants
 *
 * Defines file upload constraints for document submissions in the permit wizard.
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export type DocumentType = "building_plans" | "contracts" | "site_photos";

export interface FileFormatConfig {
  allowedFormats: string[];
  allowedMimeTypes: string[];
  maxSize: number;
  multiple: boolean;
  description: string;
}

export const ALLOWED_FILE_FORMATS: Record<DocumentType, FileFormatConfig> = {
  building_plans: {
    allowedFormats: ["JPG", "PNG", "DWG", "PDF"],
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/vnd.dwg",
      "application/acad",
      "application/x-acad",
      "application/x-dwg",
      "application/pdf",
    ],
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    description: "Building plans, blueprints, or architectural drawings",
  },
  contracts: {
    allowedFormats: ["PDF"],
    allowedMimeTypes: ["application/pdf"],
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    description: "Contracts and agreements (PDF only)",
  },
  site_photos: {
    allowedFormats: ["JPG", "PNG"],
    allowedMimeTypes: ["image/jpeg", "image/png"],
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    description: "Current site condition photos",
  },
};

export const FILE_FORMAT_LABELS: Record<DocumentType, string> = {
  building_plans: "Building Plans/Blueprints",
  contracts: "Contracts/Agreements",
  site_photos: "Site Photos/Current Condition",
};
