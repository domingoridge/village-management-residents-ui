"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { GuestForm } from "@/components/features/guests/GuestForm";
import { useCreateGuest } from "@/lib/hooks/useGuests";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import type { CreateGuestInput } from "@/lib/schemas/guest";

export default function NewGuestPage() {
  const router = useRouter();
  const { resident, tenantUser } = useAuthStore();
  const { addToast } = useUIStore();
  const createGuest = useCreateGuest();

  const handleSubmit = async (data: CreateGuestInput) => {
    if (!resident?.householdId) {
      addToast({
        type: "error",
        message: "Household information not found",
      });
      return;
    }

    if (!tenantUser?.tenantId) {
      addToast({
        type: "error",
        message: "Tenant information not found",
      });
      return;
    }

    try {
      await createGuest.mutateAsync({
        input: data,
        householdId: resident.householdId,
        tenantId: tenantUser.tenantId,
        tenantUserId: tenantUser.id,
      });

      router.push(ROUTES.GUESTS.LIST);
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Failed to create guest:", error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-authorize Guest</CardTitle>
          <CardDescription>
            Register a guest for entry to the village. The guard will be
            notified and can verify this pre-authorization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm
            onSubmit={handleSubmit}
            isLoading={createGuest.isPending}
            submitLabel="Pre-authorize Guest"
          />
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="rounded-lg bg-info-50 p-4">
        <h3 className="mb-2 font-semibold text-info-900">
          Tips for Guest Pre-authorization:
        </h3>
        <ul className="space-y-1 text-sm text-info-800">
          <li>• Provide accurate information for faster verification</li>
          <li>
            • Add phone number if you want to be contacted when guest arrives
          </li>
          <li>• Include vehicle plate number if guest is driving</li>
          <li>• Special instructions help guards identify your guest</li>
          <li>• You can pre-authorize guests up to 30 days in advance</li>
        </ul>
      </div>
    </div>
  );
}
