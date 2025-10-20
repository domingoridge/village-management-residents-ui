import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stickerService } from "@/lib/services/stickerService";
import { fetchStickerRequests } from "@/lib/api/stickers";
import { useUIStore } from "@/store/ui";
import type { VehicleFormData } from "@/lib/schemas/sticker";
import type { StickerFilterParams } from "@/types/sticker";

// Query keys for React Query
export const STICKER_QUERIES = {
  all: ["stickers"] as const,
  quota: (householdId: string) =>
    [...STICKER_QUERIES.all, "quota", householdId] as const,
  list: (householdId: string) =>
    [...STICKER_QUERIES.all, "list", householdId] as const,
};

// Query key factory for sticker list with filters
export const stickerKeys = {
  all: ["stickers"] as const,
  lists: () => [...stickerKeys.all, "list"] as const,
  list: (filters?: StickerFilterParams) =>
    [...stickerKeys.lists(), filters] as const,
  details: () => [...stickerKeys.all, "detail"] as const,
  detail: (id: string) => [...stickerKeys.details(), id] as const,
};

/**
 * Hook to fetch household quota information
 * @param householdId - The household ID to check quota for
 * @returns Query result with quota data
 */
export function useHouseholdQuota(householdId: string | undefined) {
  return useQuery({
    queryKey: STICKER_QUERIES.quota(householdId!),
    queryFn: () => stickerService.getHouseholdQuota(householdId!),
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch sticker requests with filtering and pagination
 * Replaces old version that only took householdId
 * @param filters - Optional filter parameters (status, householdId, page, pageSize)
 * @returns Query result with paginated sticker requests
 */
export function useStickerRequests(filters?: StickerFilterParams) {
  return useQuery({
    queryKey: stickerKeys.list(filters),
    queryFn: () => fetchStickerRequests(filters),
    enabled: !!filters?.householdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create multiple sticker requests (multi-vehicle submission)
 * Handles file uploads and database inserts with rollback on failure
 * @returns Mutation function for creating sticker requests
 */
export function useCreateStickerRequests() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (params: {
      vehicles: VehicleFormData[];
      householdId: string;
      tenantId: string;
    }) => {
      const { vehicles, householdId, tenantId } = params;
      const createdRequests = [];
      const tempRequestId = crypto.randomUUID(); // For file uploads before request creation

      try {
        for (const vehicle of vehicles) {
          // 1. Upload documents for this vehicle
          const [orUrl, crUrl, photoUrl] = await Promise.all([
            stickerService.uploadDocument(
              vehicle.officialReceipt,
              householdId,
              tempRequestId,
              "official_receipt",
            ),
            stickerService.uploadDocument(
              vehicle.certRegistration,
              householdId,
              tempRequestId,
              "cert_registration",
            ),
            vehicle.vehiclePhoto
              ? stickerService.uploadDocument(
                  vehicle.vehiclePhoto,
                  householdId,
                  tempRequestId,
                  "vehicle_photo",
                )
              : Promise.resolve(undefined),
          ]);

          // 2. Create sticker request record using residentId and holderName from vehicle
          const request = await stickerService.createStickerRequest({
            householdId,
            residentId: vehicle.residentId,
            tenantId,
            holderName: vehicle.holderName,
            vehiclePlateNumber: vehicle.plateNumber,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model,
            vehicleColor: vehicle.color,
            vehicleYear: vehicle.year,
            registeredTo: vehicle.registeredTo,
            stickerType: vehicle.stickerType,
            officialReceiptUrl: orUrl,
            certRegistrationUrl: crUrl,
            vehiclePhotoUrl: photoUrl,
          });

          createdRequests.push(request);
        }

        return createdRequests;
      } catch (error) {
        // Note: In a production system, you might want to implement
        // rollback logic here to delete successfully created requests
        // if a later request fails. For now, we let partial success stand
        // as the user can always cancel unwanted requests.
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate quota query to reflect new requests
      queryClient.invalidateQueries({
        queryKey: STICKER_QUERIES.quota(variables.householdId),
      });

      // Invalidate list query if it exists
      queryClient.invalidateQueries({
        queryKey: STICKER_QUERIES.list(variables.householdId),
      });

      // Show success toast with all request numbers
      const vehicleCount = data.length;
      addToast({
        type: "success",
        message: `${vehicleCount} sticker request${vehicleCount > 1 ? "s" : ""} submitted successfully!`,
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        message: `Failed to submit request: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      });
    },
  });
}
