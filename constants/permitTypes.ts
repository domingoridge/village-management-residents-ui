/**
 * Permit Types Configuration
 *
 * Defines the available permit types and their metadata for the permit application wizard.
 * These types determine which form schema is loaded and which documents are required.
 */

export type PermitType =
  | "construction"
  | "renovation"
  | "maintenance"
  | "gate_pass"
  | "other";

export type PermitCategory = "building" | "access" | "general";

export interface PermitTypeMetadata {
  key: PermitType;
  displayName: string;
  category: PermitCategory;
  description: string;
  estimatedProcessingDays: number;
  requiresDocuments: boolean;
  hasFormSchema: boolean;
}

export const PERMIT_TYPES: Record<PermitType, PermitTypeMetadata> = {
  construction: {
    key: "construction",
    displayName: "Construction Permit",
    category: "building",
    description: "For new construction projects",
    estimatedProcessingDays: 5,
    requiresDocuments: true,
    hasFormSchema: true,
  },
  renovation: {
    key: "renovation",
    displayName: "Renovation Permit",
    category: "building",
    description: "For modification or renovation of existing structures",
    estimatedProcessingDays: 5,
    requiresDocuments: true,
    hasFormSchema: true,
  },
  maintenance: {
    key: "maintenance",
    displayName: "Maintenance Request",
    category: "building",
    description: "For routine maintenance and minor repairs",
    estimatedProcessingDays: 1,
    requiresDocuments: false,
    hasFormSchema: false,
  },
  gate_pass: {
    key: "gate_pass",
    displayName: "Gate Pass",
    category: "access",
    description: "For deliveries, move-ins, move-outs, and vehicle access",
    estimatedProcessingDays: 1,
    requiresDocuments: false,
    hasFormSchema: true,
  },
  other: {
    key: "other",
    displayName: "Other Request",
    category: "general",
    description:
      "For other types of requests not covered by standard permit types",
    estimatedProcessingDays: 10,
    requiresDocuments: false,
    hasFormSchema: false,
  },
};

export const PERMIT_TYPE_OPTIONS = Object.values(PERMIT_TYPES).map((type) => ({
  value: type.key,
  label: type.displayName,
}));
