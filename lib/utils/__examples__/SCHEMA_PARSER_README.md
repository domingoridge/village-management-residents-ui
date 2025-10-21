# Schema Parser Utility

A TypeScript utility for parsing JSON Schema Draft 2020-12 format files and extracting structured metadata for dynamic form generation.

## Location

`/lib/utils/schemaParser.ts`

## Features

- ✅ Parses JSON Schema Draft 2020-12 format
- ✅ Extracts sections based on top-level properties
- ✅ Extracts field metadata including type, order, validation rules
- ✅ Supports custom `x-*` properties for UI hints
- ✅ TypeScript strict mode compliant
- ✅ Fully typed with comprehensive interfaces
- ✅ Automatic field type inference when `x-fieldType` is not specified

## Type Definitions

### JsonSchema Interfaces

```typescript
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
  "x-fieldType"?: string; // Custom field type (e.g., 'date', 'textarea')
  "x-order"?: number; // Display order
  "x-helperText"?: string; // Helper text for users
  "x-placeholder"?: string; // Input placeholder
  "x-enumLabels"?: string[]; // Labels for enum options
}

export interface JsonSchemaSection {
  type?: string;
  title?: string;
  properties?: Record<string, JsonSchemaField>;
  required?: string[];
  "x-order"?: number; // Section display order
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
```

### Parsed Metadata Interfaces

```typescript
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
```

## API Functions

### parseSchema(schema: JsonSchema): ParsedSchema

Parses a complete JSON Schema and returns structured metadata.

```typescript
import { parseSchema } from "@/lib/utils/schemaParser";
import constructionSchema from "@/lib/schemas/permits/construction.json";

const parsed = parseSchema(constructionSchema);
console.log(parsed.title); // "Construction Permit Application"
console.log(parsed.sections.length); // 2
```

### extractSections(schema: JsonSchema): SectionMetadata[]

Extracts all sections from a JSON Schema without sorting.

```typescript
import { extractSections } from "@/lib/utils/schemaParser";

const sections = extractSections(constructionSchema);
sections.forEach((section) => {
  console.log(section.key, section.title);
});
```

### getSectionOrder(schema: JsonSchema): SectionMetadata[]

Gets sections in display order based on `x-order` property.

```typescript
import { getSectionOrder } from "@/lib/utils/schemaParser";

const orderedSections = getSectionOrder(constructionSchema);
// Returns sections sorted by their x-order values
```

### getFieldByPath(schema: JsonSchema, fieldPath: string): FieldMetadata | null

Gets a specific field by its dot-notation path (e.g., "projectInfo.projectStartDate").

```typescript
import { getFieldByPath } from "@/lib/utils/schemaParser";

const field = getFieldByPath(
  constructionSchema,
  "projectInfo.projectStartDate",
);
console.log(field?.title); // "Project Start Date"
console.log(field?.fieldType); // "date"
```

### getRequiredFields(schema: JsonSchema): string[]

Gets all required field paths in dot notation.

```typescript
import { getRequiredFields } from "@/lib/utils/schemaParser";

const required = getRequiredFields(constructionSchema);
// ["projectInfo.projectStartDate", "projectInfo.projectEndDate", ...]
```

### extractFieldMetadata(field: JsonSchemaField, fieldKey: string, requiredFields?: string[]): FieldMetadata

Extracts field metadata from a JSON Schema field definition.

```typescript
import { extractFieldMetadata } from "@/lib/utils/schemaParser";

const fieldMeta = extractFieldMetadata(
  { type: "string", title: "Name", "x-fieldType": "text" },
  "name",
  ["name"],
);
```

### validateSchemaStructure(schema: JsonSchema): { isValid: boolean; errors: string[] }

Validates that a schema follows the expected structure.

```typescript
import { validateSchemaStructure } from "@/lib/utils/schemaParser";

const validation = validateSchemaStructure(constructionSchema);
if (!validation.isValid) {
  console.error("Schema errors:", validation.errors);
}
```

## Field Type Inference

When `x-fieldType` is not specified, the parser automatically infers the field type:

| Condition                       | Inferred Type |
| ------------------------------- | ------------- |
| Has `enum` property             | `select`      |
| `format: "date"`                | `date`        |
| `format: "date-time"`           | `datetime`    |
| `format: "email"`               | `email`       |
| `type: "number"` or `"integer"` | `number`      |
| `type: "boolean"`               | `checkbox`    |
| `maxLength > 100`               | `textarea`    |
| `pattern` contains `\d`         | `tel`         |
| Default                         | `text`        |

## Example Schema Structure

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Construction Permit Application",
  "type": "object",
  "properties": {
    "projectInfo": {
      "type": "object",
      "title": "Project Information",
      "x-order": 1,
      "properties": {
        "projectStartDate": {
          "type": "string",
          "format": "date",
          "title": "Project Start Date",
          "x-fieldType": "date",
          "x-order": 1
        }
      },
      "required": ["projectStartDate"]
    }
  }
}
```

## Usage in React Components

```typescript
import { parseSchema } from '@/lib/utils/schemaParser';
import constructionSchema from '@/lib/schemas/permits/construction.json';

function PermitForm() {
  const { sections } = parseSchema(constructionSchema);

  return (
    <form>
      {sections.map(section => (
        <div key={section.key}>
          <h2>{section.title}</h2>
          {section.fields.map(field => (
            <FormField
              key={field.key}
              name={`${section.key}.${field.key}`}
              label={field.title}
              type={field.fieldType}
              required={field.required}
              placeholder={field.placeholder}
              helperText={field.helperText}
            />
          ))}
        </div>
      ))}
    </form>
  );
}
```

## Tests

Test file located at: `/lib/utils/__tests__/schemaParser.test.ts`

Run tests with:

```bash
npm test schemaParser.test.ts
```

## Examples

Comprehensive examples available at: `/lib/utils/__examples__/schemaParser.example.ts`

## TypeScript Configuration

This utility is built with TypeScript strict mode enabled and follows all linting rules defined in the project's ESLint configuration.
