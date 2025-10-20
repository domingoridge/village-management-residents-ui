"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  Phone,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { GuestStatusBadge } from "@/components/features/guests/GuestStatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuest, useDeleteGuest } from "@/lib/hooks/useGuests";
import { useRealtime } from "@/lib/hooks/useRealtime";
import { useUIStore } from "@/store/ui";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const guestId = params.id as string;

  // Use TanStack Query hook
  const { data: guest, isLoading } = useGuest(guestId);
  const deleteGuest = useDeleteGuest();

  // Realtime updates for this specific guest
  useRealtime({
    table: "guest",
    filter: `id=eq.${guestId}`,
    onUpdate: () => {
      queryClient.invalidateQueries({
        queryKey: ["guests", "detail", guestId],
      });
    },
    onDelete: () => {
      addToast({
        type: "info",
        message: "Guest has been deleted",
      });
      router.push(ROUTES.GUESTS.LIST);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteGuest.mutateAsync(guestId);
      router.push(ROUTES.GUESTS.LIST);
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Failed to delete guest:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!guest) {
    return null;
  }

  const canEdit = guest.status === "pending";
  const canDelete = guest.status === "pending" || guest.status === "denied";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Guests
      </Button>

      {/* Guest Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <CardTitle className="text-2xl">{guest.guestName}</CardTitle>
                <GuestStatusBadge status={guest.status} />
              </div>
              <p className="text-neutral/70">{guest.purpose}</p>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(ROUTES.GUESTS.EDIT(guest.id))}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visit Date(s) */}
            <div>
              <h3 className="mb-3 font-semibold text-neutral">
                Visit Date
                {guest.visitDateEnd &&
                guest.visitDateEnd !== guest.visitDateStart
                  ? "s"
                  : ""}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-neutral/50" />
                  <span>
                    {formatDate(guest.visitDateStart)}
                    {guest.visitDateEnd &&
                      guest.visitDateEnd !== guest.visitDateStart && (
                        <> to {formatDate(guest.visitDateEnd)}</>
                      )}
                    {guest.visitDuration && (
                      <span className="ml-2 text-sm text-neutral/70">
                        ({guest.visitDuration} day
                        {guest.visitDuration !== 1 ? "s" : ""})
                      </span>
                    )}
                  </span>
                </div>
                {guest.expectedArrivalTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-neutral/50" />
                    <span>
                      Expected arrival:{" "}
                      {formatTime(
                        new Date(`2000-01-01T${guest.expectedArrivalTime}`),
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {(guest.phone || guest.vehiclePlate) && (
              <div>
                <h3 className="mb-3 font-semibold text-neutral">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {guest.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-neutral/50" />
                      <span>{guest.phone}</span>
                    </div>
                  )}
                  {guest.vehiclePlate && (
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-neutral/50" />
                      <span>{guest.vehiclePlate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {guest.specialInstructions && (
              <div>
                <h3 className="mb-3 font-semibold text-neutral">
                  Special Instructions
                </h3>
                <p className="rounded-lg bg-neutral/5 p-4 text-neutral/80">
                  {guest.specialInstructions}
                </p>
              </div>
            )}

            {/* Arrival Time (if at gate or completed) */}
            {guest.arrivalTime && (
              <div>
                <h3 className="mb-3 font-semibold text-neutral">
                  Actual Arrival
                </h3>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-neutral/50" />
                  <span>{formatDateTime(guest.arrivalTime)}</span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-neutral/20 pt-4">
              <h3 className="mb-3 font-semibold text-neutral">Details</h3>
              <div className="space-y-1 text-sm text-neutral/70">
                <p>Pre-authorized on {formatDateTime(guest.createdAt)}</p>
                <p>Last updated {formatDateTime(guest.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Guest Pre-authorization"
        description="Are you sure you want to delete this guest pre-authorization? This action cannot be undone."
      >
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteGuest.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="error"
            onClick={handleDelete}
            isLoading={deleteGuest.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
