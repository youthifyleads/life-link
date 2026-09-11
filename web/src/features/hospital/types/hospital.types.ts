import type {
  BloodGroup,
  RequestStatus,
  UrgencyLevel,
} from "@/shared/components/clinical/clinical.types";

export const bloodComponents = [
  "red_cells",
  "platelets",
  "fresh_frozen_plasma",
  "cryoprecipitate",
  "whole_blood",
] as const;

export type BloodComponent = (typeof bloodComponents)[number];

export const bloodComponentLabels: Record<BloodComponent, string> = {
  red_cells: "Red blood cells",
  platelets: "Platelets",
  fresh_frozen_plasma: "Fresh frozen plasma",
  cryoprecipitate: "Cryoprecipitate",
  whole_blood: "Whole blood",
};

export type DocumentReviewStatus = "pending" | "accepted" | "changes_requested";

export interface SupportingDocument {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  reviewStatus: DocumentReviewStatus;
  source?: "fixture" | "local_preview";
}

export interface HospitalDocumentItem extends SupportingDocument {
  requestId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  urgency: UrgencyLevel;
  targetBloodBankName: string;
}

export interface RequestHistoryEvent {
  id: string;
  status: RequestStatus;
  occurredAt: string;
  actor: string;
  note?: string;
}

export interface TargetBloodBank {
  id: string;
  name: string;
  facilityCode: string;
  governorate: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  availabilitySummary: {
    totalAvailable: number;
    posture: "optimal" | "warning" | "critical";
    lowStockGroupsCount: number;
  };
}

export interface HospitalRequest {
  id: string;
  bloodBankId: string;
  targetBloodBank: TargetBloodBank;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  quantity: number;
  urgency: UrgencyLevel;
  requiredAt: string;
  reason: string;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history: RequestHistoryEvent[];
  documents: SupportingDocument[];
}

export interface HospitalRequestInput {
  bloodBankId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  quantity: number;
  urgency: UrgencyLevel;
  requiredAt: string;
  reason: string;
  notes?: string;
}

export type RequestSort = "newest" | "oldest" | "required_soonest";

export interface RequestFilters {
  search: string;
  status: RequestStatus | "all";
  urgency: UrgencyLevel | "all";
  bloodGroup: BloodGroup | "all";
  sort: RequestSort;
}
