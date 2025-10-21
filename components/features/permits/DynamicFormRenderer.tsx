/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DynamicFormRenderer Component
 *
 * Dynamically renders form fields based on JSON Schema 2020-12 specification.
 * Reuses shared Input, Select, Textarea components for consistency.
 */

"use client";

import {
  type UseFormReturn,
  type FieldValues,
  Controller,
} from "react-hook-form";
import type { FormSchema, FieldDefinition } from "@/types/forms";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";

interface DynamicFormRendererProps<T extends FieldValues = FieldValues> {
  schema: FormSchema;
  form: UseFormReturn<T>;
  className?: string;
}

/**
 * Sorts form fields by x-order property for consistent rendering
 */
function sortFieldsByOrder(
  properties: Record<string, FieldDefinition>,
): Array<[string, FieldDefinition]> {
  return Object.entries(properties).sort((a, b) => {
    const orderA = a[1]["x-order"] ?? 999;
    const orderB = b[1]["x-order"] ?? 999;
    return orderA - orderB;
  });
}

/**
 * Renders a single form field based on field definition
 */
function renderField<T extends FieldValues>(
  fieldName: string,
  fieldDef: FieldDefinition,
  form: UseFormReturn<T>,
  isRequired: boolean,
  parentPath?: string,
): React.ReactNode {
  const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
  const error = parentPath
    ? ((form.formState.errors[parentPath as keyof T] as any)?.[fieldName]
        ?.message as string | undefined)
    : (form.formState.errors[fieldName]?.message as string | undefined);
  const fieldType = fieldDef["x-fieldType"] || "text";

  // Common props for all field types
  const commonProps = {
    label: fieldDef.title || fieldName,
    placeholder: fieldDef["x-placeholder"],
    helperText: fieldDef["x-helperText"],
    required: isRequired,
    disabled: false,
    fullWidth: true,
    error,
  };

  // Render based on field type
  switch (fieldType) {
    case "textarea": {
      const maxLength = fieldDef.maxLength;
      return (
        <Textarea
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          showCharCount={maxLength !== undefined}
          maxCharCount={maxLength}
          maxLength={maxLength}
          data-testid={`field-${fullPath}`}
        />
      );
    }

    case "select": {
      // Convert enum values to SelectOption format
      const options: SelectOption[] =
        fieldDef.enum?.map((value) => ({
          value: String(value),
          label: String(value)
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        })) || [];

      return (
        <Select
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          options={options}
          placeholder={fieldDef["x-placeholder"] || "Select an option"}
          data-testid={`field-${fullPath}`}
        />
      );
    }

    case "number": {
      return (
        <Controller
          key={fullPath}
          name={fullPath as keyof T}
          control={form.control}
          render={({ field }) => (
            <Input
              {...commonProps}
              type="number"
              min={fieldDef.minimum}
              max={fieldDef.maximum}
              step={fieldDef.type === "integer" ? "1" : "any"}
              value={field.value || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  field.onChange(undefined);
                } else {
                  const parsed =
                    fieldDef.type === "integer"
                      ? parseInt(value, 10)
                      : parseFloat(value);
                  field.onChange(isNaN(parsed) ? undefined : parsed);
                }
              }}
              onBlur={field.onBlur}
              name={field.name}
              data-testid={`field-${fullPath}`}
            />
          )}
        />
      );
    }

    case "date": {
      return (
        <Input
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          type="date"
          data-testid={`field-${fullPath}`}
        />
      );
    }

    case "email": {
      return (
        <Input
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          type="email"
          data-testid={`field-${fullPath}`}
        />
      );
    }

    case "tel": {
      return (
        <Input
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          type="tel"
          data-testid={`field-${fullPath}`}
        />
      );
    }

    case "file": {
      return (
        <Controller
          key={fullPath}
          name={fullPath as keyof T}
          control={form.control}
          render={({ field }) => (
            <FileUpload
              {...commonProps}
              value={field.value}
              onChange={field.onChange}
              accept={fieldDef["x-placeholder"]} // Use placeholder for accept types
              maxSize={fieldDef.maxLength} // Reuse maxLength for file size
              multiple={false}
              data-testid={`field-${fullPath}`}
            />
          )}
        />
      );
    }

    case "text":
    default: {
      return (
        <Input
          key={fullPath}
          {...commonProps}
          {...form.register(fullPath as keyof T)}
          type="text"
          minLength={fieldDef.minLength}
          maxLength={fieldDef.maxLength}
          pattern={fieldDef.pattern}
          data-testid={`field-${fullPath}`}
        />
      );
    }
  }
}

/**
 * DynamicFormRenderer Component
 *
 * Accepts a JSON Schema and react-hook-form instance, then dynamically renders
 * all form fields using shared UI components.
 *
 * @example
 * ```tsx
 * const schema = await import('@/lib/schemas/permits/construction.json');
 * const form = useForm();
 *
 * <DynamicFormRenderer schema={schema.default} form={form} />
 * ```
 */
export function DynamicFormRenderer<T extends FieldValues = FieldValues>({
  schema,
  form,
  className,
}: DynamicFormRendererProps<T>) {
  const requiredFields = new Set(schema.required || []);
  const sortedFields = sortFieldsByOrder(schema.properties);

  return (
    <div className={className} data-testid="dynamic-form-renderer">
      <div className="space-y-6">
        {sortedFields.map(([fieldName, fieldDef]) => {
          // Check if this is a nested object (grouped fields)
          if (fieldDef.type === "object" && fieldDef.properties) {
            const nestedRequired = new Set(fieldDef.required || []);
            const sortedNestedFields = sortFieldsByOrder(fieldDef.properties);

            return (
              <div key={fieldName} className="space-y-4">
                {/* Group heading */}
                <h3 className="text-lg font-semibold text-neutral border-b border-base-300 pb-2">
                  {fieldDef.title || fieldName}
                </h3>
                {/* Nested fields */}
                <div className="space-y-4">
                  {sortedNestedFields.map(
                    ([nestedFieldName, nestedFieldDef]) => {
                      const isRequired = nestedRequired.has(nestedFieldName);
                      return renderField(
                        nestedFieldName,
                        nestedFieldDef,
                        form,
                        isRequired,
                        fieldName,
                      );
                    },
                  )}
                </div>
              </div>
            );
          }

          // Regular field (flat schema)
          const isRequired = requiredFields.has(fieldName);
          return renderField(fieldName, fieldDef, form, isRequired);
        })}
      </div>
    </div>
  );
}
