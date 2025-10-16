"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createGuestSchema, type CreateGuestInput } from "@/lib/schemas/guest";

interface GuestFormProps {
  onSubmit: (data: CreateGuestInput) => Promise<void>;
  initialData?: Partial<CreateGuestInput>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function GuestForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = "Submit",
}: GuestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGuestInput>({
    resolver: zodResolver(createGuestSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Guest Name */}
      <Input
        label="Guest Name"
        placeholder="Juan Dela Cruz"
        error={errors.guestName?.message}
        fullWidth
        required
        {...register("guestName")}
      />

      {/* Contact Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="09XX-XXX-XXXX"
          error={errors.phone?.message}
          helperText="Optional - for contact purposes"
          fullWidth
          {...register("phone")}
        />

        <Input
          label="Vehicle Plate Number"
          placeholder="ABC-1234"
          error={errors.vehiclePlate?.message}
          helperText="Optional - if arriving by vehicle"
          fullWidth
          {...register("vehiclePlate")}
        />
      </div>

      {/* Purpose */}
      <div>
        <label
          htmlFor="purpose"
          className="mb-1 block text-sm font-medium text-neutral"
        >
          Purpose of Visit <span className="text-error-500">*</span>
        </label>
        <textarea
          id="purpose"
          rows={3}
          className="w-full rounded-lg border-2 border-neutral/20 bg-white px-4 py-3 text-base text-neutral transition-colors placeholder:text-neutral/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Brief description of visit purpose"
          {...register("purpose")}
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-error-500">
            {errors.purpose.message}
          </p>
        )}
      </div>

      {/* Expected Arrival */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Expected Arrival Date"
          type="date"
          error={errors.expectedArrivalDate?.message}
          fullWidth
          required
          {...register("expectedArrivalDate")}
        />

        <Input
          label="Expected Arrival Time"
          type="time"
          error={errors.expectedArrivalTime?.message}
          helperText="Optional"
          fullWidth
          {...register("expectedArrivalTime")}
        />
      </div>

      {/* Special Instructions */}
      <div>
        <label
          htmlFor="specialInstructions"
          className="mb-1 block text-sm font-medium text-neutral"
        >
          Special Instructions
        </label>
        <textarea
          id="specialInstructions"
          rows={3}
          className="w-full rounded-lg border-2 border-neutral/20 bg-white px-4 py-3 text-base text-neutral transition-colors placeholder:text-neutral/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Any special instructions for the guard (optional)"
          {...register("specialInstructions")}
        />
        {errors.specialInstructions && (
          <p className="mt-1 text-sm text-error-500">
            {errors.specialInstructions.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
