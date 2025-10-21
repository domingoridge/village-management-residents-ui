/**
 * Test file for schemaParser utility
 *
 * This demonstrates how to use the schema parser with actual permit schemas.
 * To run: npm test schemaParser.test.ts
 */

import {
  parseSchema,
  extractSections,
  getSectionOrder,
  getFieldByPath,
  getRequiredFields,
  validateSchemaStructure,
  type JsonSchema,
  type ParsedSchema,
  type SectionMetadata,
  type FieldMetadata,
} from "../schemaParser";

// Import actual schema files
import constructionSchema from "../../schemas/permits/construction.json";
import gatePassSchema from "../../schemas/permits/gate_pass.json";
import renovationSchema from "../../schemas/permits/renovation.json";

describe("schemaParser", () => {
  describe("parseSchema", () => {
    it("should parse construction schema correctly", () => {
      const parsed: ParsedSchema = parseSchema(
        constructionSchema as JsonSchema,
      );

      expect(parsed.title).toBe("Construction Permit Application");
      expect(parsed.description).toBe(
        "Form schema for new construction permit applications",
      );
      expect(parsed.sections).toHaveLength(2);
    });

    it("should parse gate pass schema correctly", () => {
      const parsed: ParsedSchema = parseSchema(gatePassSchema as JsonSchema);

      expect(parsed.title).toBe("Gate Pass Application");
      expect(parsed.sections).toHaveLength(2);
    });

    it("should throw error for invalid schema", () => {
      expect(() => parseSchema(null as unknown as JsonSchema)).toThrow(
        "Invalid schema",
      );
    });
  });

  describe("extractSections", () => {
    it("should extract sections from construction schema", () => {
      const sections: SectionMetadata[] = extractSections(
        constructionSchema as JsonSchema,
      );

      expect(sections).toHaveLength(2);
      expect(sections[0].key).toBe("projectInfo");
      expect(sections[0].title).toBe("Project Information");
      expect(sections[1].key).toBe("contractorInfo");
      expect(sections[1].title).toBe("Contractor Information");
    });

    it("should extract fields from each section", () => {
      const sections: SectionMetadata[] = extractSections(
        constructionSchema as JsonSchema,
      );
      const projectInfoSection = sections[0];

      expect(projectInfoSection.fields).toHaveLength(3);
      expect(projectInfoSection.fields[0].key).toBe("projectStartDate");
      expect(projectInfoSection.fields[0].fieldType).toBe("date");
      expect(projectInfoSection.fields[0].required).toBe(true);
    });
  });

  describe("getSectionOrder", () => {
    it("should return sections in correct order", () => {
      const sections: SectionMetadata[] = getSectionOrder(
        constructionSchema as JsonSchema,
      );

      expect(sections[0].order).toBe(1);
      expect(sections[1].order).toBe(2);
      expect(sections[0].key).toBe("projectInfo");
      expect(sections[1].key).toBe("contractorInfo");
    });

    it("should sort fields within sections by order", () => {
      const sections: SectionMetadata[] = getSectionOrder(
        constructionSchema as JsonSchema,
      );
      const projectInfoFields = sections[0].fields;

      expect(projectInfoFields[0].order).toBeLessThanOrEqual(
        projectInfoFields[1].order,
      );
      expect(projectInfoFields[1].order).toBeLessThanOrEqual(
        projectInfoFields[2].order,
      );
    });
  });

  describe("getFieldByPath", () => {
    it("should get field by dot-notation path", () => {
      const field: FieldMetadata | null = getFieldByPath(
        constructionSchema as JsonSchema,
        "projectInfo.projectStartDate",
      );

      expect(field).not.toBeNull();
      expect(field?.key).toBe("projectStartDate");
      expect(field?.title).toBe("Project Start Date");
      expect(field?.fieldType).toBe("date");
    });

    it("should return null for invalid path", () => {
      const field: FieldMetadata | null = getFieldByPath(
        constructionSchema as JsonSchema,
        "invalid.path",
      );

      expect(field).toBeNull();
    });
  });

  describe("getRequiredFields", () => {
    it("should get all required field paths", () => {
      const requiredFields: string[] = getRequiredFields(
        constructionSchema as JsonSchema,
      );

      expect(requiredFields).toContain("projectInfo.projectStartDate");
      expect(requiredFields).toContain("projectInfo.projectEndDate");
      expect(requiredFields).toContain("projectInfo.projectDescription");
      expect(requiredFields).toContain("contractorInfo.contractorName");
    });
  });

  describe("validateSchemaStructure", () => {
    it("should validate correct schema structure", () => {
      const result = validateSchemaStructure(constructionSchema as JsonSchema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid schema structure", () => {
      const invalidSchema = {
        title: "Invalid Schema",
        type: "string", // Should be 'object'
      };

      const result = validateSchemaStructure(invalidSchema as JsonSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Field metadata extraction", () => {
    it("should extract field metadata correctly", () => {
      const sections: SectionMetadata[] = extractSections(
        constructionSchema as JsonSchema,
      );
      const descriptionField = sections[0].fields.find(
        (f) => f.key === "projectDescription",
      );

      expect(descriptionField).toBeDefined();
      expect(descriptionField?.title).toBe("Project Description");
      expect(descriptionField?.fieldType).toBe("textarea");
      expect(descriptionField?.placeholder).toBe(
        "Describe your construction project...",
      );
      expect(descriptionField?.helperText).toBe("Maximum 500 characters");
      expect(descriptionField?.minLength).toBe(10);
      expect(descriptionField?.maxLength).toBe(500);
    });

    it("should extract enum options for select fields", () => {
      const sections: SectionMetadata[] = extractSections(
        gatePassSchema as JsonSchema,
      );
      const passTypeField = sections[0].fields.find(
        (f) => f.key === "passType",
      );

      expect(passTypeField).toBeDefined();
      expect(passTypeField?.fieldType).toBe("select");
      expect(passTypeField?.enum).toEqual(["delivery", "move_out"]);
    });

    it("should infer field types when x-fieldType is not specified", () => {
      const sections: SectionMetadata[] = extractSections(
        renovationSchema as JsonSchema,
      );
      const emailField = sections[1].fields.find(
        (f) => f.key === "contractorEmail",
      );

      expect(emailField).toBeDefined();
      expect(emailField?.fieldType).toBe("email");
      expect(emailField?.format).toBe("email");
    });
  });
});
