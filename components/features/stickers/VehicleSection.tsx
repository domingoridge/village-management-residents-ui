"use client";

import { UseFormReturn } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DocumentUploadField } from "./DocumentUploadField";
import { StickerRequestFormData } from "@/lib/schemas/sticker";
import type { ResidentWithProfile } from "@/lib/services/residentService";
import {
  MAX_FILE_SIZE,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from "@/constants/stickers";

interface VehicleSectionProps {
  index: number;
  form: UseFormReturn<StickerRequestFormData>;
  onRemove: () => void;
  canRemove: boolean;
  residents: ResidentWithProfile[];
  residentsLoading: boolean;
}

export function VehicleSection({
  index,
  form,
  onRemove,
  canRemove,
  residents,
  residentsLoading,
}: VehicleSectionProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const vehicleErrors = errors.vehicles?.[index];
  const currentYear = new Date().getFullYear();

  // Watch for resident selection changes and update holderName
  const selectedResidentId = watch(`vehicles.${index}.residentId`);
  const selectedResident = residents.find((r) => r.id === selectedResidentId);

  // Update holderName when resident changes
  if (selectedResident && selectedResident.fullName) {
    const currentHolderName = watch(`vehicles.${index}.holderName`);
    if (currentHolderName !== selectedResident.fullName) {
      setValue(`vehicles.${index}.holderName`, selectedResident.fullName);
    }
  }

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vehicle {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="gap-2 text-error hover:bg-error/10"
            aria-label={`Remove vehicle ${index + 1} from request`}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Resident Dropdown */}
        <Select
          label="Resident"
          {...register(`vehicles.${index}.residentId`)}
          error={vehicleErrors?.residentId?.message}
          required
          disabled={residentsLoading}
          placeholder={
            residentsLoading ? "Loading residents..." : "Select a resident"
          }
          options={residents.map((resident) => ({
            value: resident.id,
            label: resident.fullName,
          }))}
          fullWidth
        />

        {/* Plate Number */}
        <Input
          label="Vehicle Plate Number"
          {...register(`vehicles.${index}.plateNumber`)}
          error={vehicleErrors?.plateNumber?.message}
          required
          placeholder="e.g., ABC-1234"
          autoComplete="off"
        />

        {/* Make and Model in a row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Vehicle Make"
            {...register(`vehicles.${index}.make`)}
            error={vehicleErrors?.make?.message}
            required
            placeholder="e.g., Toyota"
            autoComplete="off"
          />
          <Input
            label="Vehicle Model"
            {...register(`vehicles.${index}.model`)}
            error={vehicleErrors?.model?.message}
            required
            placeholder="e.g., Camry"
            autoComplete="off"
          />
        </div>

        {/* Color and Year in a row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Vehicle Color"
            {...register(`vehicles.${index}.color`)}
            error={vehicleErrors?.color?.message}
            placeholder="e.g., Silver"
            autoComplete="off"
          />
          <Input
            label="Year"
            type="number"
            {...register(`vehicles.${index}.year`, { valueAsNumber: true })}
            error={vehicleErrors?.year?.message}
            placeholder={currentYear.toString()}
            min={1900}
            max={currentYear}
            autoComplete="off"
          />
        </div>

        {/* Registered To */}
        <Input
          label="Registered To"
          {...register(`vehicles.${index}.registeredTo`)}
          error={vehicleErrors?.registeredTo?.message}
          placeholder="Legal owner's name"
          autoComplete="off"
        />

        {/* Hidden fields */}
        <input
          type="hidden"
          {...register(`vehicles.${index}.stickerType`)}
          value="resident"
        />
        <input type="hidden" {...register(`vehicles.${index}.holderName`)} />

        {/* Document Uploads */}
        <div className="space-y-4 rounded-lg bg-base-200 p-4">
          <h4 className="font-medium">Required Documents</h4>

          <DocumentUploadField
            label="Official Receipt (OR)"
            name={`vehicles.${index}.officialReceipt`}
            required
            acceptedTypes={ACCEPTED_DOCUMENT_TYPES}
            maxSize={MAX_FILE_SIZE}
            value={watch(`vehicles.${index}.officialReceipt`)}
            onChange={(file) =>
              setValue(`vehicles.${index}.officialReceipt`, file as File)
            }
            error={vehicleErrors?.officialReceipt?.message}
          />

          <DocumentUploadField
            label="Certificate of Registration (CR)"
            name={`vehicles.${index}.certRegistration`}
            required
            acceptedTypes={ACCEPTED_DOCUMENT_TYPES}
            maxSize={MAX_FILE_SIZE}
            value={watch(`vehicles.${index}.certRegistration`)}
            onChange={(file) =>
              setValue(`vehicles.${index}.certRegistration`, file as File)
            }
            error={vehicleErrors?.certRegistration?.message}
          />

          <div className="pt-2">
            <h4 className="mb-4 font-medium">Optional Documents</h4>
            <DocumentUploadField
              label="Vehicle Photo"
              name={`vehicles.${index}.vehiclePhoto`}
              acceptedTypes={ACCEPTED_IMAGE_TYPES}
              maxSize={MAX_FILE_SIZE}
              value={watch(`vehicles.${index}.vehiclePhoto`)}
              onChange={(file) =>
                setValue(`vehicles.${index}.vehiclePhoto`, file)
              }
              error={vehicleErrors?.vehiclePhoto?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
