/**
 * JSON Schema Validator Utilities
 *
 * Utilities for validating data against JSON Schema Draft 2020-12 specifications.
 */

import type { FormSchema, ValidationResult, FieldError } from "@/types/forms";

/**
 * Validate form data against a JSON Schema
 *
 * Note: This is a simplified validator. For production use, consider using
 * a library like Ajv for full JSON Schema 2020-12 support.
 */
export function validateAgainstSchema(
  data: Record<string, unknown>,
  schema: FormSchema,
): ValidationResult {
  const errors: FieldError[] = [];

  // Check required fields
  if (schema.required) {
    for (const fieldName of schema.required) {
      if (
        !(fieldName in data) ||
        data[fieldName] === undefined ||
        data[fieldName] === null ||
        data[fieldName] === ""
      ) {
        errors.push({
          field: fieldName,
          message: `${schema.properties[fieldName]?.title || fieldName} is required`,
        });
      }
    }
  }

  // Validate individual fields
  for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
    const value = data[fieldName];

    // Skip validation if field is not present and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    const typeErrors = validateType(fieldName, value, fieldSchema, schema);
    errors.push(...typeErrors);

    // String validations
    if (fieldSchema.type === "string" && typeof value === "string") {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be at least ${fieldSchema.minLength} characters`,
        });
      }

      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be at most ${fieldSchema.maxLength} characters`,
        });
      }

      if (fieldSchema.pattern) {
        const regex = new RegExp(fieldSchema.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldSchema.title || fieldName} format is invalid`,
          });
        }
      }

      // Email validation
      if (fieldSchema.format === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldSchema.title || fieldName} must be a valid email address`,
          });
        }
      }

      // Date validation
      if (fieldSchema.format === "date") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldSchema.title || fieldName} must be a valid date (YYYY-MM-DD)`,
          });
        }
      }
    }

    // Number validations
    if (
      (fieldSchema.type === "number" || fieldSchema.type === "integer") &&
      typeof value === "number"
    ) {
      if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be at least ${fieldSchema.minimum}`,
        });
      }

      if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be at most ${fieldSchema.maximum}`,
        });
      }
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldSchema.title || fieldName} must be one of: ${fieldSchema.enum.join(", ")}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate value type matches schema type
 */
function validateType(
  fieldName: string,
  value: unknown,
  fieldSchema: FormSchema["properties"][string],
  parentSchema: FormSchema,
): FieldError[] {
  const errors: FieldError[] = [];
  const actualType = Array.isArray(value) ? "array" : typeof value;

  switch (fieldSchema.type) {
    case "string":
      if (typeof value !== "string") {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be a string`,
        });
      }
      break;
    case "number":
    case "integer":
      if (typeof value !== "number") {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be a number`,
        });
      }
      if (fieldSchema.type === "integer" && !Number.isInteger(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be an integer`,
        });
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be a boolean`,
        });
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be an array`,
        });
      }
      break;
    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema.title || fieldName} must be an object`,
        });
      }
      break;
  }

  return errors;
}

/**
 * Get default values from schema
 */
export function getSchemaDefaults(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
    if (fieldSchema.default !== undefined) {
      defaults[fieldName] = fieldSchema.default;
    }
  }

  return defaults;
}
