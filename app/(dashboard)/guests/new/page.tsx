"use client";

import { useState } from "react";
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
import { createGuest } from "@/lib/api/guests";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import type { CreateGuestInput } from "@/lib/schemas/guest";

export default function NewGuestPage() {
  const router = useRouter();
  const { resident } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateGuestInput) => {
    if (!resident?.householdId) {
      addToast({
        type: "error",
        message: "Household information not found",
      });
      return;
    }

    try {
      setIsLoading(true);
      await createGuest(data, resident.householdId);

      addToast({
        type: "success",
        message: "Guest pre-authorized successfully",
      });

      router.push(ROUTES.GUESTS.LIST);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create guest",
      });
    } finally {
      setIsLoading(false);
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
            isLoading={isLoading}
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
