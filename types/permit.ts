/**
 * Permit Application Types
 *
 * Core type definitions for permit applications and related entities.
 */

import type { PermitType } from "@/constants/permitTypes";
import type { DocumentType } from "@/constants/fileFormats";

export type PermitStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "pending_payment";

export interface ContractorInformation {
  name: string;
  contactNumber: string;
  email: string;
  businessAddress: string;
}

export interface DocumentUpload {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string; // ISO 8601 datetime string
  status: "pending" | "uploaded" | "failed";
}

export interface FormAnswers<T> {
  [key: string]: T;
}

export interface PermitApplication {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formAnswers: FormAnswers<any>;
  residentId: string;
  permitType: PermitType;
  status: PermitStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface PermitApplicationFormData {
  permitType: PermitType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectDetails: Partial<FormAnswers<any>>;
  documents: File[];
}
