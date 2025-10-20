export type StickerType = "resident" | "beneficial_user";

export type StickerRequestStatus =
  | "pending"
  | "active"
  | "inactive"
  | "requested";

export interface VehicleInfo {
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  year: number;
  registeredTo: string;
}

export interface StickerRequest {
  id: string;
  householdId: string;
  residentId: string;
  tenantId: string;
  vehiclePlateNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  registeredTo: string;
  stickerType: StickerType;
  status: StickerRequestStatus;
  submittedAt: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStickerRequestInput {
  householdId: string;
  residentId: string;
  tenantId: string;
  vehicles: VehicleFormData[];
}

export interface VehicleFormData {
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  year: number;
  registeredTo: string;
  stickerType: StickerType;
  officialReceipt: File;
  certRegistration: File;
  vehiclePhoto?: File;
}

export interface HouseholdQuota {
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  pendingRequests: number;
  approvedStickers: number;
}

export interface StickerFilterParams {
  status?: StickerRequestStatus;
  householdId?: string;
  page?: number;
  pageSize?: number;
}

export interface StickerListResponse {
  requests: StickerRequest[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
