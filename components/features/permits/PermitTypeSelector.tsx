/**
 * PermitTypeSelector Component
 *
 * Dropdown selector for permit types with metadata display.
 */

"use client";

import { Select, type SelectOption } from "@/components/ui/Select";
import { PERMIT_TYPES, type PermitType } from "@/constants/permitTypes";

interface PermitTypeSelectorProps {
  value: PermitType | null;
  onChange: (permitType: PermitType | null) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const permitTypeOptions: SelectOption[] = Object.values(PERMIT_TYPES).map(
  (type) => ({
    value: type.key,
    label: type.displayName,
  }),
);

/**
 * PermitTypeSelector Component
 *
 * Provides a dropdown for selecting permit type with optional metadata display.
 *
 * @example
 * ```tsx
 * const [permitType, setPermitType] = useState<PermitType | null>(null);
 *
 * <PermitTypeSelector
 *   value={permitType}
 *   onChange={setPermitType}
 *   required
 * />
 * ```
 */
export function PermitTypeSelector({
  value,
  onChange,
  error,
  disabled = false,
  required = true,
}: PermitTypeSelectorProps) {
  const selectedPermitMetadata = value ? PERMIT_TYPES[value] : null;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    if (newValue === "") {
      onChange(null);
    } else {
      onChange(newValue as PermitType);
    }
  };

  return (
    <div className="space-y-3" data-testid="permit-type-selector">
      <Select
        label="Permit Type"
        placeholder="Select permit type"
        options={permitTypeOptions}
        value={value || ""}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled}
        fullWidth
        data-testid="permit-type-dropdown"
      />

      {selectedPermitMetadata && (
        <div
          className="rounded-lg border-2 border-primary-500/20 bg-primary-500/5 p-4"
          data-testid="permit-type-metadata"
        >
          <h4 className="mb-2 text-sm font-semibold text-neutral">
            {selectedPermitMetadata.displayName}
          </h4>
          <p className="mb-3 text-sm text-neutral/70">
            {selectedPermitMetadata.description}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-neutral">
              Estimated Processing Time:
            </span>
            <span className="text-neutral/70">
              {selectedPermitMetadata.estimatedProcessingDays} days
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-medium text-neutral">Category:</span>
            <span className="rounded bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-500">
              {selectedPermitMetadata.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
