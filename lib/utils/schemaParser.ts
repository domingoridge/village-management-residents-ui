/**
 * Schema Parser Utility
 *
 * Parses JSON Schema Draft 2020-12 format files and extracts structured metadata
 * for dynamic form generation. Supports custom x-* properties for field ordering,
 * types, and UI hints.
 */

// Types for JSON Schema structure
export interface JsonSchemaField {
  type?: string;
  title?: string;
  description?: string;
  format?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  "x-fieldType"?: string;
  "x-order"?: number;
  "x-helperText"?: string;
  "x-placeholder"?: string;
  "x-enumLabels"?: string[];
}

export interface JsonSchemaSection {
  type?: string;
  title?: string;
  properties?: Record<string, JsonSchemaField>;
  required?: string[];
  "x-order"?: number;
}

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JsonSchemaSection>;
  required?: string[];
  additionalProperties?: boolean;
}

// Types for parsed schema metadata
export interface FieldMetadata {
  key: string;
  title: string;
  type: string;
  fieldType: string;
  order: number;
  required: boolean;
  description?: string;
  helperText?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  enum?: string[];
  enumLabels?: string[];
}

export interface SectionMetadata {
  key: string;
  title: string;
  order: number;
  fields: FieldMetadata[];
}

export interface ParsedSchema {
  title: string;
  description: string;
  sections: SectionMetadata[];
}

/**
 * Extract field metadata from a JSON Schema field definition
 *
 * @param field - The field schema object
 * @param fieldKey - The key/name of the field
 * @param requiredFields - Array of required field keys from parent schema
 * @returns Structured field metadata
 */
export function extractFieldMetadata(
  field: JsonSchemaField,
  fieldKey: string,
  requiredFields: string[] = [],
): FieldMetadata {
  return {
    key: fieldKey,
    title: field.title || fieldKey,
    type: field.type || "string",
    fieldType: field["x-fieldType"] || inferFieldType(field),
    order: field["x-order"] || 0,
    required: requiredFields.includes(fieldKey),
    description: field.description,
    helperText: field["x-helperText"],
    placeholder: field["x-placeholder"],
    minLength: field.minLength,
    maxLength: field.maxLength,
    minimum: field.minimum,
    maximum: field.maximum,
    pattern: field.pattern,
    format: field.format,
    enum: field.enum,
    enumLabels: field["x-enumLabels"],
  };
}

/**
 * Infer field type from JSON Schema properties when x-fieldType is not specified
 *
 * @param field - The field schema object
 * @returns Inferred field type
 */
function inferFieldType(field: JsonSchemaField): string {
  if (field.enum) return "select";
  if (field.format === "date") return "date";
  if (field.format === "date-time") return "datetime";
  if (field.format === "email") return "email";
  if (field.type === "number" || field.type === "integer") return "number";
  if (field.type === "boolean") return "checkbox";
  if (field.maxLength && field.maxLength > 100) return "textarea";
  if (field.pattern && field.pattern.includes("\\d")) return "tel";

  return "text";
}

/**
 * Extract section metadata from a schema section
 *
 * @param section - The section schema object
 * @param sectionKey - The key/name of the section
 * @returns Structured section metadata with sorted fields
 */
function extractSection(
  section: JsonSchemaSection,
  sectionKey: string,
): SectionMetadata {
  const properties = section.properties || {};
  const requiredFields = section.required || [];

  // Extract all fields
  const fields: FieldMetadata[] = Object.entries(properties).map(
    ([fieldKey, fieldSchema]) =>
      extractFieldMetadata(fieldSchema, fieldKey, requiredFields),
  );

  // Sort fields by order
  fields.sort((a, b) => a.order - b.order);

  return {
    key: sectionKey,
    title: section.title || sectionKey,
    order: section["x-order"] || 0,
    fields,
  };
}

/**
 * Extract all sections from a JSON Schema
 *
 * @param schema - The complete JSON Schema object
 * @returns Array of section metadata
 */
export function extractSections(schema: JsonSchema): SectionMetadata[] {
  if (!schema || !schema.properties) {
    return [];
  }

  const properties = schema.properties;
  const sections: SectionMetadata[] = [];

  // Iterate through top-level properties (sections)
  for (const [sectionKey, sectionSchema] of Object.entries(properties)) {
    if (typeof sectionSchema === "object" && sectionSchema !== null) {
      sections.push(extractSection(sectionSchema, sectionKey));
    }
  }

  return sections;
}

/**
 * Get sections in display order based on x-order property
 *
 * @param schema - The complete JSON Schema object
 * @returns Array of section metadata sorted by order
 */
export function getSectionOrder(schema: JsonSchema): SectionMetadata[] {
  const sections = extractSections(schema);

  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);

  return sections;
}

/**
 * Parse a complete JSON Schema and return structured metadata
 *
 * @param schema - The complete JSON Schema object
 * @returns Parsed schema with all metadata
 */
export function parseSchema(schema: JsonSchema): ParsedSchema {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema: schema must be an object");
  }

  const sections = getSectionOrder(schema);

  return {
    title: schema.title || "Untitled Schema",
    description: schema.description || "",
    sections,
  };
}

/**
 * Get a field by its path (e.g., "projectInfo.projectStartDate")
 *
 * @param schema - The complete JSON Schema object
 * @param fieldPath - Dot-notation path to the field
 * @returns Field metadata or null if not found
 */
export function getFieldByPath(
  schema: JsonSchema,
  fieldPath: string,
): FieldMetadata | null {
  const [sectionKey, fieldKey] = fieldPath.split(".");

  if (!sectionKey || !fieldKey) {
    return null;
  }

  const sections = extractSections(schema);
  const section = sections.find((s) => s.key === sectionKey);

  if (!section) {
    return null;
  }

  return section.fields.find((f) => f.key === fieldKey) || null;
}

/**
 * Get all required fields from a schema
 *
 * @param schema - The complete JSON Schema object
 * @returns Array of required field paths in dot notation
 */
export function getRequiredFields(schema: JsonSchema): string[] {
  const sections = extractSections(schema);
  const requiredPaths: string[] = [];

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.required) {
        requiredPaths.push(`${section.key}.${field.key}`);
      }
    }
  }

  return requiredPaths;
}

/**
 * Validate that a schema follows the expected structure
 *
 * @param schema - The schema to validate
 * @returns Object with isValid flag and any error messages
 */
export function validateSchemaStructure(schema: JsonSchema): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema || typeof schema !== "object") {
    errors.push("Schema must be an object");
    return { isValid: false, errors };
  }

  if (!schema.$schema || !schema.$schema.includes("json-schema.org")) {
    errors.push("Schema must include a valid $schema property");
  }

  if (!schema.properties || typeof schema.properties !== "object") {
    errors.push("Schema must have a properties object");
  }

  if (schema.type !== "object") {
    errors.push('Root schema type must be "object"');
  }

  // Validate sections have required structure
  if (schema.properties) {
    for (const [sectionKey, sectionSchema] of Object.entries(
      schema.properties,
    )) {
      if (typeof sectionSchema !== "object" || sectionSchema === null) {
        errors.push(`Section "${sectionKey}" must be an object`);
        continue;
      }

      if (sectionSchema.type !== "object") {
        errors.push(`Section "${sectionKey}" type must be "object"`);
      }

      if (!sectionSchema.properties) {
        errors.push(`Section "${sectionKey}" must have properties`);
      }

      if (!sectionSchema.title) {
        errors.push(`Section "${sectionKey}" should have a title`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
