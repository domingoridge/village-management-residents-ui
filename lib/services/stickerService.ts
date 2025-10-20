import { createClient } from "@/lib/supabase/browser";
import type { StickerRequest, HouseholdQuota } from "@/types/sticker";

export const stickerService = {
  /**
   * Get household quota information
   * @param householdId - The household ID to check quota for
   * @returns Quota details including total, used, and remaining quotas
   */
  async getHouseholdQuota(householdId: string): Promise<HouseholdQuota> {
    const supabase = createClient();

    // Get household quota
    const { data: household, error: householdError } = await supabase
      .from("household")
      .select("sticker_quota")
      .eq("id", householdId)
      .single();

    if (householdError) throw householdError;

    const { count: usedCount, error: countError } = await supabase
      .from("vehicle_sticker")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId);

    if (countError) throw countError;

    // Count pending only
    const { count: pendingCount } = await supabase
      .from("vehicle_sticker")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId);

    const totalQuota = household.sticker_quota;
    const usedQuota = usedCount || 0;
    const pendingRequests = pendingCount || 0;

    return {
      totalQuota,
      usedQuota,
      remainingQuota: totalQuota - usedQuota,
      pendingRequests,
      approvedStickers: usedQuota - pendingRequests,
    };
  },

  /**
   * Upload document to Supabase Storage
   * @param file - The file to upload
   * @param householdId - The household ID
   * @param requestId - The request ID (can be temp UUID for batch uploads)
   * @param documentType - Type of document (official_receipt, cert_registration, vehicle_photo)
   * @returns Public URL of the uploaded file
   */
  async uploadDocument(
    file: File,
    householdId: string,
    requestId: string,
    documentType: string,
  ): Promise<string> {
    const supabase = createClient();
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filePath = `${householdId}/${requestId}/${documentType}_${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
      .from("vehicle-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Return public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("vehicle-documents").getPublicUrl(data.path);

    return publicUrl;
  },

  /**
   * Create a single sticker request
   * @param payload - The sticker request data
   * @returns The created sticker request with camelCase fields
   */
  async createStickerRequest(payload: {
    householdId: string;
    residentId: string;
    tenantId: string;
    holderName: string;
    vehiclePlateNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor?: string;
    vehicleYear?: number;
    registeredTo?: string;
    stickerType: "resident" | "beneficial_user";
    officialReceiptUrl: string;
    certRegistrationUrl: string;
    vehiclePhotoUrl?: string;
  }): Promise<StickerRequest> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("vehicle_sticker")
      .insert({
        household_id: payload.householdId,
        issued_to: payload.residentId,
        tenant_id: payload.tenantId,
        holder_name: payload.holderName,
        vehicle_plate_number: payload.vehiclePlateNumber,
        vehicle_make: payload.vehicleMake,
        vehicle_model: payload.vehicleModel,
        vehicle_color: payload.vehicleColor || null,
        vehicle_year: payload.vehicleYear || null,
        vehicle_registered_to: payload.registeredTo || null,
        sticker_type: payload.stickerType,
        status: "requested",
      })
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase
    return {
      id: data.id,
      householdId: data.household_id,
      residentId: data.resident_id,
      tenantId: data.tenant_id,
      vehiclePlateNumber: data.vehicle_plate_number,
      vehicleMake: data.vehicle_make,
      vehicleModel: data.vehicle_model,
      vehicleColor: data.vehicle_color,
      vehicleYear: data.vehicle_year,
      registeredTo: data.registered_to,
      stickerType: data.sticker_type,
      status: data.status,
      submittedAt: data.submitted_at,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Get sticker requests for a household
   * @param householdId - The household ID
   * @returns List of sticker requests
   */
  async getStickerRequests(householdId: string): Promise<StickerRequest[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("vehicle_sticker")
      .select("*")
      .eq("household_id", householdId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase for all items
    return data.map((item) => ({
      id: item.id,
      householdId: item.household_id,
      residentId: item.resident_id,
      tenantId: item.tenant_id,
      vehiclePlateNumber: item.vehicle_plate_number,
      vehicleMake: item.vehicle_make,
      vehicleModel: item.vehicle_model,
      vehicleColor: item.vehicle_color,
      vehicleYear: item.vehicle_year,
      registeredTo: item.registered_to,
      stickerType: item.sticker_type,
      status: item.status,
      submittedAt: item.submitted_at,
      reviewedAt: item.reviewed_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },
};
