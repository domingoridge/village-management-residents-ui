"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { QuotaWarning } from "./QuotaWarning";
import { VehicleSection } from "./VehicleSection";
import { useHouseholdResidents } from "@/lib/hooks/useResidents";
import {
  stickerRequestFormSchema,
  type StickerRequestFormData,
} from "@/lib/schemas/sticker";

interface StickerRequestFormProps {
  householdId: string;
  maxQuota: number;
  remainingQuota: number;
  onSubmit: (data: StickerRequestFormData) => void;
  isLoading: boolean;
}

export function StickerRequestForm({
  householdId,
  maxQuota,
  remainingQuota,
  onSubmit,
  isLoading,
}: StickerRequestFormProps) {
  const currentYear = new Date().getFullYear();

  // Fetch residents for the household
  const { data: residents = [], isLoading: residentsLoading } =
    useHouseholdResidents(householdId);

  const form = useForm<StickerRequestFormData>({
    resolver: zodResolver(stickerRequestFormSchema),
    defaultValues: {
      vehicles: [
        {
          plateNumber: "",
          residentId: "",
          holderName: "",
          make: "",
          model: "",
          color: "",
          year: currentYear,
          registeredTo: "",
          stickerType: "resident",
        },
      ],
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const usedQuota = maxQuota - remainingQuota;
  const vehicleCount = 1; // Single vehicle for MVP (Phase 3)

  const handleFormSubmit = (data: StickerRequestFormData) => {
    // Check quota before submission
    if (data.vehicles.length > remainingQuota) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Quota Warning */}
      <QuotaWarning
        used={usedQuota}
        total={maxQuota}
        currentVehicles={vehicleCount}
      />

      {/* Vehicle Section */}
      <VehicleSection
        index={0}
        form={form}
        onRemove={() => {}}
        canRemove={false}
        residents={residents}
        residentsLoading={residentsLoading}
      />

      {/* Form-level errors */}
      {errors.vehicles && (
        <div
          className="rounded-lg border border-error bg-error/5 p-4"
          role="alert"
        >
          <p className="font-medium text-error">
            Please fix the following errors:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-error">
            {Object.entries(errors.vehicles).map(([key, value]) => (
              <li key={key}>
                {typeof value === "object" &&
                value !== null &&
                "message" in value
                  ? value.message
                  : "Invalid field"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4 border-t border-base-300 pt-6">
        <Button
          type="submit"
          disabled={isLoading || vehicleCount > remainingQuota}
          className="min-w-[200px]"
          data-testid="submit-sticker-request"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Submitting...
            </>
          ) : (
            `Submit Request`
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="rounded-lg bg-info/10 p-4 text-sm text-info-content">
        <p className="font-medium">Before you submit:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            Ensure all information matches your vehicle registration documents
          </li>
          <li>
            Upload clear, legible copies of your Official Receipt and
            Certificate of Registration
          </li>
          <li>Double-check your plate number for accuracy</li>
          <li>Your request will be reviewed by the admin team</li>
        </ul>
      </div>
    </form>
  );
}
