/**
 * usePermitForm Hook
 *
 * Manages permit form state with react-hook-form and Zod validation.
 * Converts JSON Schema to Zod schema for runtime validation.
 */

import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodSchema } from "zod";
import { useEffect, useMemo } from "react";
import type { FormSchema, FieldDefinition } from "@/types/forms";

interface UsePermitFormOptions<T extends FieldValues = FieldValues> {
  schema: FormSchema | null;
  defaultValues?: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface UsePermitFormReturn<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  isValid: boolean;
  isDirty: boolean;
  handleSubmit: (data: T) => void | Promise<void>;
}

/**
 * Converts a JSON Schema FieldDefinition to a Zod schema
 */
function fieldDefinitionToZodSchema(
  fieldName: string,
  field: FieldDefinition,
  isRequired: boolean,
): z.ZodTypeAny {
  let zodSchema: z.ZodTypeAny;

  // Handle different field types
  switch (field.type) {
    case "string": {
      let stringSchema = z.string();

      // Email format validation
      if (field.format === "email") {
        stringSchema = z.string().email("Invalid email address");
      }
      // Date format validation
      else if (field.format === "date") {
        stringSchema = z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");
      }
      // Pattern validation
      else if (field.pattern) {
        stringSchema = z
          .string()
          .regex(
            new RegExp(field.pattern),
            `Invalid format for ${field.title || fieldName}`,
          );
      }

      // Length validations
      if (field.minLength !== undefined) {
        stringSchema = stringSchema.min(
          field.minLength,
          `Minimum ${field.minLength} characters required`,
        );
      }
      if (field.maxLength !== undefined) {
        stringSchema = stringSchema.max(
          field.maxLength,
          `Maximum ${field.maxLength} characters allowed`,
        );
      }

      // Enum validation (for select fields)
      if (field.enum && field.enum.length > 0) {
        const enumValues = field.enum as [string, ...string[]];
        zodSchema = z.enum(enumValues, {
          errorMap: () => ({
            message: `Please select a valid ${field.title || fieldName}`,
          }),
        });
      } else {
        zodSchema = stringSchema;
      }
      break;
    }

    case "number":
    case "integer": {
      let numberSchema =
        field.type === "integer"
          ? z.number().int("Must be a whole number")
          : z.number();

      // Min/max validations
      if (field.minimum !== undefined) {
        numberSchema = numberSchema.min(
          field.minimum,
          `Minimum value is ${field.minimum}`,
        );
      }
      if (field.maximum !== undefined) {
        numberSchema = numberSchema.max(
          field.maximum,
          `Maximum value is ${field.maximum}`,
        );
      }

      zodSchema = numberSchema;
      break;
    }

    case "boolean":
      zodSchema = z.boolean();
      break;

    case "array":
      zodSchema = z.array(z.unknown());
      break;

    case "object": {
      // Handle nested objects with properties
      if (field.properties) {
        const nestedShape: Record<string, z.ZodTypeAny> = {};
        const nestedRequired = new Set(field.required || []);

        Object.entries(field.properties).forEach(
          ([nestedFieldName, nestedFieldDef]) => {
            const isNestedRequired = nestedRequired.has(nestedFieldName);
            nestedShape[nestedFieldName] = fieldDefinitionToZodSchema(
              nestedFieldName,
              nestedFieldDef,
              isNestedRequired,
            );
          },
        );

        zodSchema = z.object(nestedShape);
      } else {
        // Fallback for objects without defined properties
        zodSchema = z.record(z.unknown());
      }
      break;
    }

    default:
      zodSchema = z.unknown();
  }

  // Handle optional vs required fields
  if (!isRequired) {
    zodSchema = zodSchema.optional();
  }

  return zodSchema;
}

/**
 * Converts a JSON Schema to a Zod validation schema
 */
function jsonSchemaToZodSchema(schema: FormSchema): ZodSchema {
  const shape: Record<string, z.ZodTypeAny> = {};
  const requiredFields = new Set(schema.required || []);

  // Convert each property to a Zod schema
  Object.entries(schema.properties).forEach(([fieldName, fieldDef]) => {
    const isRequired = requiredFields.has(fieldName);
    shape[fieldName] = fieldDefinitionToZodSchema(
      fieldName,
      fieldDef,
      isRequired,
    );
  });

  return z.object(shape);
}

/**
 * Hook to manage permit form with react-hook-form and Zod validation
 *
 * @param options - Configuration options including schema, defaultValues, and onSubmit handler
 * @returns Form instance, validation state, and submit handler
 *
 * @example
 * ```tsx
 * const { form, isValid, handleSubmit } = usePermitForm({
 *   schema: constructionSchema,
 *   defaultValues: { projectStartDate: '' },
 *   onSubmit: async (data) => {
 *     await submitPermit(data);
 *   },
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit(handleSubmit)}>
 *     <Input {...form.register('projectStartDate')} />
 *     <Button type="submit" disabled={!isValid}>Submit</Button>
 *   </form>
 * );
 * ```
 */
export function usePermitForm<T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
}: UsePermitFormOptions<T>): UsePermitFormReturn<T> {
  // Convert JSON Schema to Zod schema
  const zodSchema = useMemo(() => {
    if (!schema) {
      // Return a permissive schema if no schema is provided
      return z.object({});
    }
    return jsonSchemaToZodSchema(schema);
  }, [schema]);

  // Initialize react-hook-form with Zod resolver
  const form = useForm<T>({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onChange", // Validate on change for real-time feedback
  });

  // Reset form when schema or defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // Get form state
  const { isValid, isDirty } = form.formState;

  // Handle form submission
  const handleSubmit = async (data: T) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return {
    form,
    isValid,
    isDirty,
    handleSubmit,
  };
}
