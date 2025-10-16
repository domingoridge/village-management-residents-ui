"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchGuestById, updateGuest } from "@/lib/api/guests";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import type { Guest } from "@/types";
import type { CreateGuestInput } from "@/lib/schemas/guest";

export default function EditGuestPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const guestId = params.id as string;

  // Load guest data
  useEffect(() => {
    const loadGuest = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGuestById(guestId);

        // Only allow editing if status is pending
        if (data.status !== "pending") {
          addToast({
            type: "error",
            message: "Only pending guests can be edited",
          });
          router.push(ROUTES.GUESTS.DETAIL(guestId));
          return;
        }

        setGuest(data);
      } catch (error) {
        addToast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to load guest",
        });
        router.push(ROUTES.GUESTS.LIST);
      } finally {
        setIsLoading(false);
      }
    };

    loadGuest();
  }, [guestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data: CreateGuestInput) => {
    try {
      setIsSaving(true);
      await updateGuest(guestId, data);

      addToast({
        type: "success",
        message: "Guest updated successfully",
      });

      router.push(ROUTES.GUESTS.DETAIL(guestId));
    } catch (error) {
      addToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update guest",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!guest) {
    return null;
  }

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
          <CardTitle>Edit Guest Pre-authorization</CardTitle>
          <CardDescription>
            Update the guest information. Only pending guests can be edited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm
            onSubmit={handleSubmit}
            initialData={{
              guestName: guest.guestName,
              phone: guest.phone || undefined,
              vehiclePlate: guest.vehiclePlate || undefined,
              purpose: guest.purpose,
              expectedArrivalDate: guest.expectedArrivalDate,
              expectedArrivalTime: guest.expectedArrivalTime || undefined,
              specialInstructions: guest.specialInstructions || undefined,
            }}
            isLoading={isSaving}
            submitLabel="Update Guest"
          />
        </CardContent>
      </Card>
    </div>
  );
}
