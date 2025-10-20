"use client";

import { useEffect } from "react";
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
import { useGuest, useUpdateGuest } from "@/lib/hooks/useGuests";
import { useUIStore } from "@/store/ui";
import { ROUTES } from "@/constants/routes";
import type { CreateGuestInput } from "@/lib/schemas/guest";

export default function EditGuestPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();

  const guestId = params.id as string;

  // Use TanStack Query hooks
  const { data: guest, isLoading } = useGuest(guestId);
  const updateGuest = useUpdateGuest();

  // Redirect if guest is not pending
  useEffect(() => {
    if (guest && guest.status !== "pending") {
      addToast({
        type: "error",
        message: "Only pending guests can be edited",
      });
      router.push(ROUTES.GUESTS.DETAIL(guestId));
    }
  }, [guest, guestId, router, addToast]);

  const handleSubmit = async (data: CreateGuestInput) => {
    try {
      await updateGuest.mutateAsync({
        id: guestId,
        input: data,
      });

      router.push(ROUTES.GUESTS.DETAIL(guestId));
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Failed to update guest:", error);
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
              visitDateStart: guest.visitDateStart,
              visitDateEnd: guest.visitDateEnd,
              visitDuration: guest.visitDuration || undefined,
              expectedArrivalTime: guest.expectedArrivalTime || undefined,
              specialInstructions: guest.specialInstructions || undefined,
            }}
            isLoading={updateGuest.isPending}
            submitLabel="Update Guest"
          />
        </CardContent>
      </Card>
    </div>
  );
}
