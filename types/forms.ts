/**
 * Form Schema Types
 *
 * Type definitions for JSON Schema 2020-12 based dynamic form rendering.
 */

export type JSONSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "number"
  | "file";

export interface FieldDefinition {
  type: JSONSchemaType;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  required?: boolean;
  // UI hints for rendering
  "x-fieldType"?: FieldType;
  "x-placeholder"?: string;
  "x-helperText"?: string;
  "x-order"?: number;
}

export interface FormSchema {
  $schema: string; // Should be "https://json-schema.org/draft/2020-12/schema"
  $id?: string;
  title: string;
  description?: string;
  type: "object";
  properties: Record<string, FieldDefinition>;
  required?: string[];
  additionalProperties?: boolean;
  // Conditional rendering support
  if?: Partial<FormSchema>;
  then?: Partial<FormSchema>;
  else?: Partial<FormSchema>;
  allOf?: Partial<FormSchema>[];
  anyOf?: Partial<FormSchema>[];
  oneOf?: Partial<FormSchema>[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}
