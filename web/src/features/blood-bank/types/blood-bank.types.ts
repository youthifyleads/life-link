import type {
  BloodGroup,
  RequestStatus,
  UrgencyLevel,
} from "@/shared/components/clinical/clinical.types";

export const bloodBankComponents = [
  "red_cells",
  "platelets",
  "fresh_frozen_plasma",
  "cryoprecipitate",
  "whole_blood",
] as const;

export type BloodBankComponent = (typeof bloodBankComponents)[number];

export const bloodBankComponentLabels: Record<BloodBankComponent, string> = {
  red_cells: "Red blood cells",
  platelets: "Platelets",
  fresh_frozen_plasma: "Fresh frozen plasma",
  cryoprecipitate: "Cryoprecipitate",
  whole_blood: "Whole blood",
};

export const bloodBankQueueStatuses = [
  "submitted",
  "acknowledged",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
  "rejected",
] as const satisfies readonly RequestStatus[];

export type BloodBankQueueStatus = (typeof bloodBankQueueStatuses)[number];

export interface RequestingHospital {
  id: string;
  name: string;
  facilityCode: string;
}

export type BloodUnitStatus =
  | "available"
  | "allocated"
  | "reserved"
  | "quarantined"
  | "expired";

export type CustodyEventType =
  | "registered"
  | "reserved"
  | "allocated"
  | "deallocated"
  | "prepared"
  | "released"
  | "handoff_completed"
  | "quarantined"
  | "expired";

export interface CustodyEvent {
  id: string;
  event: CustodyEventType;
  title: string;
  timestamp: string;
  location: string;
  actor: string;
  role: string;
  relatedRequestId?: string;
  notes?: string;
}

export interface BloodUnit {
  id: string;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  collectionDate: string;
  expiryDate: string;
  storageLocation: string;
  status: BloodUnitStatus;
  allocatedRequestId?: string;
  notes?: string;
  registeredAt?: string;
  updatedAt?: string;
  custodyEvents?: CustodyEvent[];
}

export interface InventoryKPIs {
  totalAvailable: number;
  reservedUnits: number;
  quarantinedUnits: number;
  expiringSoon: number; // within 48 hours
  criticalLowStockGroups: BloodGroup[];
}

export type StockCondition = "optimal" | "warning" | "critical";

export interface BloodStockMatrixCell {
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  available: number;
  reserved: number;
  expiringSoon: number;
  condition: StockCondition;
}

export interface InventoryWarning {
  id: string;
  type: "critical" | "warning";
  title: string;
  description: string;
  bloodGroup?: BloodGroup;
  component?: BloodBankComponent;
  unitCount?: number;
  unitIds?: string[];
}

export type ExpiryWindowFilter =
  | "all"
  | "within_24h"
  | "within_48h"
  | "within_7d"
  | "expired";

export interface InventoryLedgerFilters {
  search: string;
  bloodGroup: BloodGroup | "all";
  component: BloodBankComponent | "all";
  status: BloodUnitStatus | "all";
  expiryWindow: ExpiryWindowFilter;
  sortBy: "expiry_soonest" | "expiry_latest" | "collection_newest" | "id_asc";
}

export interface BloodUnitIntakePayload {
  unitId?: string;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  collectionDate: string;
  expiryDate: string;
  quantity: number;
  storageLocation: string;
  notes?: string;
}

export type DocumentReviewStatus = "pending" | "accepted" | "changes_requested";

export interface BloodBankSupportingDocument {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  reviewStatus: DocumentReviewStatus;
}

export interface BloodBankDocumentItem extends BloodBankSupportingDocument {
  requestId: string;
  hospital: RequestingHospital;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  urgency: UrgencyLevel;
}

export interface BloodBankRequestHistoryEvent {
  id: string;
  status: BloodBankQueueStatus;
  occurredAt: string;
  actor: string;
  note?: string;
}

export interface BloodBankRequest {
  id: string;
  hospital: RequestingHospital;
  bloodGroup: BloodGroup;
  component: BloodBankComponent;
  quantity: number;
  urgency: UrgencyLevel;
  status: BloodBankQueueStatus;
  createdAt: string;
  requiredAt: string;
  updatedAt: string;
  reasonCategory: string;
  clinicalReason?: string;
  notes?: string;
  history: BloodBankRequestHistoryEvent[];
  documents: BloodBankSupportingDocument[];
  allocatedUnitIds: string[];
}

export const bloodBankRequestActions = [
  "acknowledge",
  "confirm",
  "start_preparation",
  "complete",
  "reject",
] as const;

export type BloodBankRequestAction = (typeof bloodBankRequestActions)[number];

export interface BloodBankTransitionParams {
  requestId: string;
  action: BloodBankRequestAction;
  note?: string;
  rejectReason?: string;
}

export type BloodBankRequestSort =
  "newest" | "oldest" | "required_soonest" | "highest_urgency";

export interface BloodBankRequestFilters {
  search: string;
  status: BloodBankQueueStatus | "all";
  urgency: UrgencyLevel | "all";
  bloodGroup: BloodGroup | "all";
  component: BloodBankComponent | "all";
  sort: BloodBankRequestSort;
}

export interface BloodBankOperationalSnapshot {
  availableBloodUnits: number;
  recordedAt: string;
}
