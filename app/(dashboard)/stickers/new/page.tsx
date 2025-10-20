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
import { StickerRequestForm } from "@/components/features/stickers/StickerRequestForm";
import {
  useHouseholdQuota,
  useCreateStickerRequests,
} from "@/lib/hooks/useStickers";
import { useHouseholdResidents } from "@/lib/hooks/useResidents";
import { useAuthStore } from "@/store/auth";
import { ROUTES } from "@/constants/routes";
import type { StickerRequestFormData } from "@/lib/schemas/sticker";

export default function NewStickerRequestPage() {
  const router = useRouter();
  const { resident, tenantUser } = useAuthStore();
  const householdId = resident?.householdId;
  const tenantId = tenantUser?.tenantId;

  const { data: quota, isLoading: quotaLoading } =
    useHouseholdQuota(householdId);
  const { isLoading: residentsLoading } = useHouseholdResidents(householdId);
  const createRequests = useCreateStickerRequests();

  // Show loading state while data is being fetched
  if (quotaLoading || residentsLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="text-base-content/70">Loading form data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else if ((!householdId || !tenantId) && !residentsLoading) {
    // Check for required auth data
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-error">
              Unable to load household information. Please try logging in again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    // Form is ready to render - both householdId and tenantId are guaranteed to exist here
    const handleSubmit = async (data: StickerRequestFormData) => {
      await createRequests.mutateAsync({
        vehicles: data.vehicles,
        householdId: householdId!,
        tenantId: tenantId!,
      });

      // Redirect to dashboard on success (mutation hook shows toast)
      router.push(ROUTES.DASHBOARD);
    };

    return (
      <div className="mx-auto max-w-4xl space-y-6">
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

        {/* Page Card */}
        <Card>
          <CardHeader>
            <CardTitle>Request Vehicle Sticker</CardTitle>
            <CardDescription>
              Submit a request for a vehicle access sticker. Your request will
              be reviewed by the admin team and you will be notified of the
              decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StickerRequestForm
              householdId={householdId!}
              maxQuota={quota?.totalQuota || 0}
              remainingQuota={quota?.remainingQuota || 0}
              onSubmit={handleSubmit}
              isLoading={createRequests.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
}
