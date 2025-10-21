/**
 * Schema Metadata Types
 *
 * Type definitions for working with JSON Schema metadata and form structure.
 * These types extract and organize metadata from JSON Schema 2020-12 specifications
 * to facilitate dynamic form rendering and validation.
 */

/**
 * Represents metadata for a single form field extracted from JSON Schema.
 *
 * This type contains all the information needed to render and validate a form field,
 * including display properties, validation rules, and UI hints.
 *
 * @example
 * ```typescript
 * const fieldMeta: FieldMetadata = {
 *   key: "projectStartDate",
 *   title: "Project Start Date",
 *   fieldType: "date",
 *   order: 1,
 *   required: true,
 *   helperText: "When construction will begin"
 * };
 * ```
 */
export interface FieldMetadata {
  /**
   * Unique identifier for the field (property key in schema)
   */
  key: string;

  /**
   * Human-readable label to display for the field
   */
  title: string;

  /**
   * The UI component type for rendering this field.
   * Corresponds to the x-fieldType custom property in JSON Schema.
   */
  fieldType:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "textarea"
    | "select"
    | "number"
    | "file";

  /**
   * Display order for the field (from x-order in schema).
   * Lower numbers appear first in the form.
   */
  order: number;

  /**
   * Whether this field is required for form submission
   */
  required: boolean;

  /**
   * Optional helper text to display below the field.
   * Corresponds to x-helperText in schema or the description property.
   */
  helperText?: string;

  /**
   * Optional placeholder text for the input field.
   * Corresponds to x-placeholder in schema.
   */
  placeholder?: string;

  /**
   * For select fields: available options for the dropdown.
   * Extracted from the enum property in JSON Schema.
   */
  enumOptions?: string[];

  /**
   * For number fields: optional unit label (e.g., "meters", "kg").
   * Can be used to display alongside the number input.
   */
  unit?: string;

  /**
   * Minimum value for number fields (from minimum in schema)
   */
  minimum?: number;

  /**
   * Maximum value for number fields (from maximum in schema)
   */
  maximum?: number;

  /**
   * Minimum length for string fields (from minLength in schema)
   */
  minLength?: number;

  /**
   * Maximum length for string/textarea fields (from maxLength in schema)
   */
  maxLength?: number;

  /**
   * Validation pattern for string fields (from pattern in schema)
   */
  pattern?: string;

  /**
   * Default value for the field (from default in schema)
   */
  defaultValue?: FieldValue;
}

/**
 * Represents a section grouping of related fields.
 *
 * In JSON Schema, sections are typically represented as nested object properties
 * with x-order for section-level sorting.
 *
 * @example
 * ```typescript
 * const section: SectionMetadata = {
 *   key: "projectInfo",
 *   title: "Project Information",
 *   order: 1,
 *   fields: [
 *     { key: "projectStartDate", title: "Start Date", ... },
 *     { key: "projectEndDate", title: "End Date", ... }
 *   ]
 * };
 * ```
 */
export interface SectionMetadata {
  /**
   * Unique identifier for the section (property key in schema)
   */
  key: string;

  /**
   * Human-readable title for the section
   */
  title: string;

  /**
   * Display order for the section (from x-order in schema).
   * Lower numbers appear first in the form.
   */
  order: number;

  /**
   * Array of field metadata belonging to this section,
   * already sorted by their individual order values.
   */
  fields: FieldMetadata[];

  /**
   * Optional description for the section
   */
  description?: string;
}

/**
 * Complete metadata structure extracted from a JSON Schema.
 *
 * This represents the entire form structure organized into sections
 * and fields, ready for rendering.
 *
 * @example
 * ```typescript
 * const schemaStructure: SchemaStructure = {
 *   permitType: "construction",
 *   sections: [
 *     {
 *       key: "projectInfo",
 *       title: "Project Information",
 *       order: 1,
 *       fields: [...]
 *     },
 *     {
 *       key: "contractorInfo",
 *       title: "Contractor Information",
 *       order: 2,
 *       fields: [...]
 *     }
 *   ]
 * };
 * ```
 */
export interface SchemaStructure {
  /**
   * Array of section metadata, sorted by section order
   */
  sections: SectionMetadata[];

  /**
   * The type of permit this schema is for (e.g., "construction", "renovation")
   */
  permitType: string;

  /**
   * Optional title for the entire form schema
   */
  title?: string;

  /**
   * Optional description for the entire form schema
   */
  description?: string;
}

/**
 * Union type representing all possible field values.
 *
 * Use this type for form field values in dynamic forms where the
 * exact type may vary based on the field definition.
 *
 * @example
 * ```typescript
 * const fieldValue: FieldValue = "John Doe";
 * const numericValue: FieldValue = 42;
 * const dateValue: FieldValue = "2024-01-15";
 * const emptyValue: FieldValue = null;
 * ```
 */
export type FieldValue = string | number | boolean | null | undefined;

/**
 * Type-safe record of field values keyed by field path.
 *
 * For nested fields, the key should be the dot-notation path (e.g., "projectInfo.projectStartDate").
 *
 * @example
 * ```typescript
 * const formValues: FieldValues = {
 *   "projectInfo.projectStartDate": "2024-01-15",
 *   "projectInfo.projectDescription": "Building a new garage",
 *   "contractorInfo.contractorName": "ABC Construction"
 * };
 * ```
 */
export type FieldValues = Record<string, FieldValue>;

/**
 * Validation error for a specific field.
 *
 * @example
 * ```typescript
 * const error: FieldValidationError = {
 *   fieldKey: "projectInfo.projectStartDate",
 *   message: "Start date is required",
 *   code: "required"
 * };
 * ```
 */
export interface FieldValidationError {
  /**
   * The field key or path that has the error
   */
  fieldKey: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Optional error code for programmatic handling
   */
  code?: string;
}

/**
 * Result of schema-based validation.
 *
 * @example
 * ```typescript
 * const validationResult: SchemaValidationResult = {
 *   valid: false,
 *   errors: [
 *     { fieldKey: "projectInfo.projectStartDate", message: "Required field" }
 *   ]
 * };
 * ```
 */
export interface SchemaValidationResult {
  /**
   * Whether the validation passed
   */
  valid: boolean;

  /**
   * Array of validation errors (empty if valid is true)
   */
  errors: FieldValidationError[];
}
