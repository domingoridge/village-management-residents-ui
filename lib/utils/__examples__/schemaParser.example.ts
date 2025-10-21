/**
 * Example usage of the schemaParser utility
 *
 * This file demonstrates how to use the schema parser to extract
 * metadata from JSON Schema files for dynamic form generation.
 */

import {
  parseSchema,
  extractSections,
  getSectionOrder,
  getFieldByPath,
  getRequiredFields,
  validateSchemaStructure,
  type JsonSchema,
} from "../schemaParser";

// Import a schema file
import constructionSchema from "../../schemas/permits/construction.json";

/**
 * Example 1: Parse a complete schema
 */
function example1_ParseCompleteSchema() {
  const parsed = parseSchema(constructionSchema as JsonSchema);

  console.log("Schema Title:", parsed.title);
  console.log("Description:", parsed.description);
  console.log("Number of sections:", parsed.sections.length);

  // Output:
  // Schema Title: Construction Permit Application
  // Description: Form schema for new construction permit applications
  // Number of sections: 2
}

/**
 * Example 2: Extract and iterate through sections
 */
function example2_ExtractSections() {
  const sections = getSectionOrder(constructionSchema as JsonSchema);

  sections.forEach((section) => {
    console.log(`\nSection: ${section.title} (${section.key})`);
    console.log(`Order: ${section.order}`);
    console.log(`Fields: ${section.fields.length}`);

    section.fields.forEach((field) => {
      console.log(
        `  - ${field.title} (${field.key}): ${field.fieldType} ${field.required ? "[Required]" : ""}`,
      );
    });
  });

  // Output:
  // Section: Project Information (projectInfo)
  // Order: 1
  // Fields: 3
  //   - Project Start Date (projectStartDate): date [Required]
  //   - Project End Date (projectEndDate): date [Required]
  //   - Project Description (projectDescription): textarea [Required]
  //
  // Section: Contractor Information (contractorInfo)
  // Order: 2
  // Fields: 3
  //   - Contractor Name (contractorName): text [Required]
  //   - Contractor Contact Number (contractorContactNumber): tel [Required]
  //   - Contractor Business Address (contractorBusinessAddress): textarea [Required]
}

/**
 * Example 3: Get specific field by path
 */
function example3_GetFieldByPath() {
  const field = getFieldByPath(
    constructionSchema as JsonSchema,
    "projectInfo.projectDescription",
  );

  if (field) {
    console.log("Field:", field.title);
    console.log("Type:", field.fieldType);
    console.log("Required:", field.required);
    console.log("Placeholder:", field.placeholder);
    console.log("Helper Text:", field.helperText);
    console.log("Min Length:", field.minLength);
    console.log("Max Length:", field.maxLength);
  }

  // Output:
  // Field: Project Description
  // Type: textarea
  // Required: true
  // Placeholder: Describe your construction project...
  // Helper Text: Maximum 500 characters
  // Min Length: 10
  // Max Length: 500
}

/**
 * Example 4: Get all required fields
 */
function example4_GetRequiredFields() {
  const requiredFields = getRequiredFields(constructionSchema as JsonSchema);

  console.log("Required fields:");
  requiredFields.forEach((path) => {
    console.log(`  - ${path}`);
  });

  // Output:
  // Required fields:
  //   - projectInfo.projectStartDate
  //   - projectInfo.projectEndDate
  //   - projectInfo.projectDescription
  //   - contractorInfo.contractorName
  //   - contractorInfo.contractorContactNumber
  //   - contractorInfo.contractorBusinessAddress
}

/**
 * Example 5: Validate schema structure
 */
function example5_ValidateSchema() {
  const validation = validateSchemaStructure(constructionSchema as JsonSchema);

  console.log("Is valid:", validation.isValid);
  if (!validation.isValid) {
    console.log("Errors:");
    validation.errors.forEach((error) => {
      console.log(`  - ${error}`);
    });
  }

  // Output:
  // Is valid: true
}

/**
 * Example 6: Build a dynamic form from schema
 */
function example6_BuildDynamicForm() {
  const sections = getSectionOrder(constructionSchema as JsonSchema);

  // This would be used in a React component to render a form
  const formSections = sections.map((section) => ({
    id: section.key,
    title: section.title,
    order: section.order,
    fields: section.fields.map((field) => ({
      name: `${section.key}.${field.key}`,
      label: field.title,
      type: field.fieldType,
      required: field.required,
      placeholder: field.placeholder,
      helperText: field.helperText,
      validation: {
        minLength: field.minLength,
        maxLength: field.maxLength,
        minimum: field.minimum,
        maximum: field.maximum,
        pattern: field.pattern,
      },
      options: field.enum
        ? field.enum.map((value, idx) => ({
            value,
            label: field.enumLabels?.[idx] || value,
          }))
        : undefined,
    })),
  }));

  console.log(JSON.stringify(formSections, null, 2));
}

/**
 * Example 7: Extract only section information
 */
function example7_ExtractSectionsOnly() {
  const sections = extractSections(constructionSchema as JsonSchema);

  // Get just section keys and titles
  const sectionInfo = sections.map((s) => ({
    key: s.key,
    title: s.title,
    fieldCount: s.fields.length,
  }));

  console.log("Sections:", sectionInfo);

  // Output:
  // Sections: [
  //   { key: 'projectInfo', title: 'Project Information', fieldCount: 3 },
  //   { key: 'contractorInfo', title: 'Contractor Information', fieldCount: 3 }
  // ]
}

// Export examples for use in other files
export {
  example1_ParseCompleteSchema,
  example2_ExtractSections,
  example3_GetFieldByPath,
  example4_GetRequiredFields,
  example5_ValidateSchema,
  example6_BuildDynamicForm,
  example7_ExtractSectionsOnly,
};
