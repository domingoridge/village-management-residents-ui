/**
 * Core TypeScript types for Village Management Resident UI
 * Using camelCase DTOs for frontend consumption
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface UserProfile {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantUser {
  id: string;
  userProfileId: string;
  tenantId: string;
  roleId: string;
  permissions: Record<string, unknown>;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  tenantUserId: string;
  householdId: string;
  isPrimaryContact: boolean;
  hasSignatoryRights: boolean;
  hasVisitingRights: boolean;
  idType: string | null;
  idUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Household Types
// ============================================================================

export type HouseholdStatus = "active" | "inactive" | "suspended";

export interface Household {
  id: string;
  tenantId: string;
  address: string;
  block: string | null;
  lot: string | null;
  streetNumber: string | null;
  houseNumber: string | null;
  alias: string | null;
  stickerQuota: number;
  status: HouseholdStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Guest Types
// ============================================================================

export type GuestStatus =
  | "pending"
  | "approved"
  | "at_gate"
  | "denied"
  | "completed";

export interface Guest {
  id: string;
  tenantId: string;
  householdId: string;
  guestName: string;
  phone: string | null;
  vehiclePlate: string | null;
  purpose: string;
  expectedArrivalDate: string;
  expectedArrivalTime: string | null;
  specialInstructions: string | null;
  status: GuestStatus;
  createdBy: string;
  approvedBy: string | null;
  arrivalTime: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Vehicle Sticker Types
// ============================================================================

export type StickerStatus =
  | "active"
  | "expired"
  | "revoked"
  | "pending_renewal";
export type StickerType = "beneficial_user" | "resident";

export interface VehicleSticker {
  id: string;
  tenantId: string;
  householdId: string | null;
  issuedTo: string;
  stickerType: StickerType;
  rfidCode: string;
  vehiclePlateNumber: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehicleYear: string | null;
  vehicleRegisteredTo: string | null;
  holderName: string;
  issueDate: string;
  expiryDate: string;
  status: StickerStatus;
  createdAt: string;
  updatedAt: string;
}

export type VehicleDocumentType =
  | "or"
  | "cr"
  | "insurance"
  | "drivers_license"
  | "deed_of_sale"
  | "other";

export interface VehicleStickerDocument {
  id: string;
  tenantId: string;
  vehicleStickerId: string;
  documentType: VehicleDocumentType;
  fileName: string;
  mimeType: string;
  storageUrl: string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Announcement Types
// ============================================================================

export type AnnouncementType =
  | "event"
  | "maintenance"
  | "emergency"
  | "general"
  | "rule_change"
  | "fee_notice";
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";

export interface Announcement {
  id: string;
  tenantId: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  title: string;
  content: string;
  attachments: Array<{
    url: string;
    filename: string;
    mimeType: string;
  }> | null;
  publishDate: string;
  expiryDate: string | null;
  publishedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  readAt: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentType =
  | "association_fee"
  | "road_fee"
  | "sticker_fee"
  | "penalty";
export type PaymentStatus = "pending" | "paid" | "overdue" | "failed";
export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "gcash"
  | "paymaya"
  | "card";

export interface Payment {
  id: string;
  tenantId: string;
  householdId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  dueDate: string;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  transactionReference: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Permit Types
// ============================================================================

export type PermitType =
  | "construction"
  | "renovation"
  | "maintenance"
  | "miscellaneous";
export type PermitStatus =
  | "draft"
  | "submitted"
  | "pending_payment"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Permit {
  id: string;
  tenantId: string;
  householdId: string;
  requestedBy: string;
  permitNumber: string;
  permitType: PermitType;
  projectDescription: string;
  startDate: string;
  endDate: string;
  status: PermitStatus;
  feeAmount: number;
  feePaid: boolean;
  feePaidAt: string | null;
  feeReceiptUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  documents: Array<{ url: string; filename: string }> | null;
  distributedToGuardhouseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PermitPayment {
  id: string;
  tenantId: string;
  permitId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receiptNumber: string;
  receiptUrl: string | null;
  collectedBy: string;
  paymentMetadata: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================================================
// Incident Types
// ============================================================================

export type IncidentType =
  | "security_threat"
  | "traffic_violation"
  | "noise_complaint"
  | "suspicious_activity"
  | "emergency"
  | "fire"
  | "medical"
  | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus =
  | "reported"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "closed";

export interface Incident {
  id: string;
  tenantId: string;
  reporterId: string | null;
  type: IncidentType;
  title: string;
  description: string;
  location: { lat: number; lng: number; address: string } | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  photos: Array<{ url: string; filename: string }> | null;
  isAnonymous: boolean;
  assignedGuardId: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageCategory =
  | "general_inquiry"
  | "complaint"
  | "request"
  | "feedback";

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  senderId: string;
  category: MessageCategory;
  content: string;
  attachments: Array<{ url: string; filename: string }> | null;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | "guest_arrival"
  | "payment_due"
  | "sticker_expiring"
  | "announcement_new"
  | "incident_update"
  | "message_reply";
export type NotificationPriority = "critical" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  actionButtons: Array<{ label: string; action: string }> | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// Gate Entry Types
// ============================================================================

export type EntryType =
  | "vehicle_rfid"
  | "guest"
  | "delivery"
  | "permit_holder"
  | "visitor";
export type VerificationMethod =
  | "rfid_auto"
  | "manual"
  | "guest_list"
  | "phone_call"
  | "qr_code";
export type EntryOutcome = "allowed" | "denied";

export interface GateEntryLog {
  id: string;
  tenantId: string;
  entryType: EntryType;
  verificationMethod: VerificationMethod;
  outcome: EntryOutcome;
  gate: string;
  entryTime: string;
  exitTime: string | null;
  vehicleStickerId: string | null;
  guestId: string | null;
  deliveryId: string | null;
  permitId: string | null;
  visitorName: string | null;
  plateNumber: string | null;
  purpose: string | null;
  verifiedBy: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================================================
// Role Types
// ============================================================================

export type RoleScope = "platform" | "tenant" | "household" | "security";

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  hierarchyLevel: number;
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface CurfewSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  exemptions: string[];
}

export interface GateOperatingHours {
  mainGate: { open: string; close: string };
  backGate: { open: string; close: string };
}

export interface Rule {
  id: string;
  category:
    | "Curfew"
    | "Speed Limit"
    | "Parking"
    | "Noise"
    | "Construction Hours"
    | "Pet Policy"
    | "Visitor Policy"
    | "General";
  title: string;
  description: string;
  effectiveDate: string;
  penaltyAmount?: number;
  relatedDocuments?: Array<{ url: string; filename: string }>;
}

export interface RulesAndGuidelines {
  rules: Rule[];
}

export interface ResidentialCommunityConfig {
  id: string;
  tenantId: string;
  curfewSettings: CurfewSettings;
  gateOperatingHours: GateOperatingHours;
  visitorPolicies: Record<string, unknown>;
  rulesAndGuidelines: RulesAndGuidelines;
  emergencyContacts: Record<string, unknown>;
  maintenanceSchedule: Record<string, unknown>;
  notificationPreferences: Record<string, unknown>;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
