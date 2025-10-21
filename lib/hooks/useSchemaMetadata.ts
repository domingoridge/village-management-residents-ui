/**
 * useSchemaMetadata Hook
 *
 * Custom React hook to load and parse JSON Schema metadata based on permit type.
 * This hook dynamically imports the appropriate schema file and extracts structured
 * metadata for rendering form fields organized by sections.
 *
 * @example
 * ```tsx
 * const { schemaMetadata, loading, error } = useSchemaMetadata('construction');
 *
 * if (loading) return <div>Loading schema...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 * return schemaMetadata.sections.map(section => (
 *   <SectionRenderer key={section.key} section={section} />
 * ));
 * ```
 */

import { useState, useEffect, useMemo } from "react";
import type { PermitType } from "@/constants/permitTypes";
import type { SchemaStructure } from "@/types/schema";
import { parseSchema } from "@/lib/utils/schemaParser";

interface UseSchemaMetadataResult {
  /** Parsed schema metadata with sections and fields */
  schemaMetadata: SchemaStructure | null;
  /** Loading state while schema is being fetched and parsed */
  loading: boolean;
  /** Error message if schema loading or parsing fails */
  error: string | null;
  /** Refetch function to reload the schema */
  refetch: () => void;
}

/**
 * Load and parse JSON Schema metadata for a specific permit type
 *
 * @param permitType - The type of permit (construction, renovation, gate_pass, etc.)
 * @returns Schema metadata, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function PermitDetailsPage({ permitType }: { permitType: PermitType }) {
 *   const { schemaMetadata, loading, error } = useSchemaMetadata(permitType);
 *
 *   if (loading) {
 *     return <div>Loading permit schema...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>Error loading schema: {error}</div>;
 *   }
 *
 *   if (!schemaMetadata) {
 *     return <div>No schema available for this permit type</div>;
 *   }
 *
 *   return (
 *     <div>
 *       {schemaMetadata.sections.map(section => (
 *         <section key={section.key}>
 *           <h2>{section.title}</h2>
 *           {section.fields.map(field => (
 *             <div key={field.key}>{field.title}</div>
 *           ))}
 *         </section>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSchemaMetadata(
  permitType: PermitType | null,
): UseSchemaMetadataResult {
  const [schemaMetadata, setSchemaMetadata] = useState<SchemaStructure | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useMemo(
    () => () => setRefetchTrigger((prev) => prev + 1),
    [],
  );

  useEffect(() => {
    // Reset state if permitType is null
    if (!permitType) {
      setSchemaMetadata(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    async function loadSchema() {
      setLoading(true);
      setError(null);

      try {
        // Dynamically import the JSON schema file based on permit type
        const schemaModule = await import(
          `@/lib/schemas/permits/${permitType}.json`
        );
        const schema = schemaModule.default || schemaModule;

        // Parse the schema using the schema parser utility
        const parsed = parseSchema(schema);

        if (isMounted) {
          setSchemaMetadata({
            ...parsed,
            permitType,
          });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(
            `Failed to load schema for permit type: ${permitType}`,
            err,
          );

          // Check if the error is due to missing schema file
          const errorMessage =
            err instanceof Error
              ? err.message.includes("Cannot find module")
                ? `No schema file found for permit type: ${permitType}`
                : `Failed to parse schema: ${err.message}`
              : `Unknown error loading schema for permit type: ${permitType}`;

          setError(errorMessage);
          setSchemaMetadata(null);
          setLoading(false);
        }
      }
    }

    loadSchema();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [permitType, refetchTrigger]);

  return {
    schemaMetadata,
    loading,
    error,
    refetch,
  };
}

/**
 * Get field metadata by field key from schema metadata
 *
 * @param schemaMetadata - Parsed schema metadata
 * @param fieldKey - Field key to search for (supports dot notation for nested fields)
 * @returns Field metadata or undefined if not found
 *
 * @example
 * ```tsx
 * const fieldMetadata = getFieldMetadata(schemaMetadata, 'projectInfo.projectStartDate');
 * console.log(fieldMetadata?.title); // "Project Start Date"
 * ```
 */
export function getFieldMetadata(
  schemaMetadata: SchemaStructure | null,
  fieldKey: string,
) {
  if (!schemaMetadata) return undefined;

  for (const section of schemaMetadata.sections) {
    const field = section.fields.find((f) => f.key === fieldKey);
    if (field) return field;
  }

  return undefined;
}

/**
 * Get all required field keys from schema metadata
 *
 * @param schemaMetadata - Parsed schema metadata
 * @returns Array of required field keys
 *
 * @example
 * ```tsx
 * const requiredFields = getRequiredFieldKeys(schemaMetadata);
 * console.log(requiredFields); // ['projectInfo.projectStartDate', 'projectInfo.projectEndDate', ...]
 * ```
 */
export function getRequiredFieldKeys(
  schemaMetadata: SchemaStructure | null,
): string[] {
  if (!schemaMetadata) return [];

  const requiredKeys: string[] = [];

  for (const section of schemaMetadata.sections) {
    for (const field of section.fields) {
      if (field.required) {
        requiredKeys.push(field.key);
      }
    }
  }

  return requiredKeys;
}
