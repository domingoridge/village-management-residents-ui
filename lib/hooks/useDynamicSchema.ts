/**
 * useDynamicSchema Hook
 *
 * Dynamically loads JSON Schema files based on permit type.
 * Returns the parsed schema with loading and error states.
 */

import { useState, useEffect } from "react";
import type { FormSchema } from "@/types/forms";
import type { PermitType } from "@/constants/permitTypes";

interface UseDynamicSchemaReturn {
  schema: FormSchema | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to dynamically load and parse JSON Schema files for permit forms
 *
 * @param permitType - The type of permit ('construction' | 'renovation' | 'electrical' | 'plumbing')
 * @returns Object containing schema, loading state, and error state
 *
 * @example
 * ```tsx
 * const { schema, loading, error } = useDynamicSchema('construction');
 *
 * if (loading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!schema) return null;
 *
 * return <DynamicFormRenderer schema={schema} />;
 * ```
 */
export function useDynamicSchema(
  permitType: PermitType | null,
): UseDynamicSchemaReturn {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when permitType changes or is null
    if (!permitType) {
      setSchema(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const loadSchema = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dynamically import the JSON Schema file based on permit type
        const schemaModule = await import(
          `@/lib/schemas/permits/${permitType}.json`
        );

        // The imported module contains a default export with the JSON content
        const loadedSchema = schemaModule.default as FormSchema;

        // Validate that the loaded schema has the required structure
        if (!loadedSchema || typeof loadedSchema !== "object") {
          throw new Error(
            `Invalid schema format for permit type: ${permitType}`,
          );
        }

        if (loadedSchema.type !== "object" || !loadedSchema.properties) {
          throw new Error(
            `Schema for ${permitType} must have type 'object' and properties field`,
          );
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setSchema(loadedSchema);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : `Failed to load schema for ${permitType}`;
          setError(new Error(errorMessage));
          setSchema(null);
          setLoading(false);
        }
      }
    };

    loadSchema();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [permitType]);

  return { schema, loading, error };
}
