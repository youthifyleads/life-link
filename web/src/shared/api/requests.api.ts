import { apiClient } from "@/shared/api/http-client";
import { normalizeBackendRequestStatus } from "@/shared/adapters/status-adapter";
import type {
  HospitalRequest,
  HospitalRequestInput,
  RequestFilters,
  RequestHistoryEvent,
  TargetBloodBank,
} from "@/features/hospital/types/hospital.types";
import type { BloodGroup, UrgencyLevel } from "@/shared/components/clinical/clinical.types";
import type {
  BloodBankRequest,
  BloodBankQueueStatus,
  BloodBankComponent,
} from "@/features/blood-bank/types/blood-bank.types";

export interface BackendBloodRequestDTO {
  id: string;
  hospital_id: string;
  target_blood_bank_id?: string | null;
  blood_type: string;
  component?: string | null;
  quantity_units: number;
  urgency: string | boolean;
  status: string;
  unit_price?: number | null;
  total_amount?: number | null;
  allocated_bags?: string[] | null;
  patient_id?: string | null;
  patient_name?: string | null;
  medical_record_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  tracking_reference?: string | null;
}

export interface BackendTimelineEventDTO {
  id: string;
  request_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  reason?: string | null;
  created_at: string;
}

export function normalizeUrgency(val: unknown): UrgencyLevel {
  if (typeof val === "boolean") {
    return val ? "emergency" : "routine";
  }
  const s = String(val || "").toLowerCase().trim();
  if (s === "emergency" || s === "critical") return "emergency";
  if (s === "urgent" || s === "true" || s === "1") return "urgent";
  return "routine";
}

export function mapBackendDtoToHospitalRequest(
  dto: BackendBloodRequestDTO,
  targetBloodBank?: TargetBloodBank,
): HospitalRequest {
  const fallbackBank: TargetBloodBank = targetBloodBank || {
    id: dto.target_blood_bank_id || "default-blood-bank",
    name: "Central Blood Bank Facility",
    facilityCode: "BB-CENTRAL",
    governorate: "Cairo",
    address: "Medical Center District",
    phone: "+20 2 2456 7890",
    status: "active",
    availabilitySummary: {
      totalAvailable: 42,
      posture: "optimal",
      lowStockGroupsCount: 1,
    },
  };

  const qty = dto.quantity_units || 1;
  const unitP = dto.unit_price != null ? Number(dto.unit_price) : 350;
  const totalAmt = dto.total_amount != null ? Number(dto.total_amount) : unitP * qty;

  return {
    id: dto.id,
    bloodBankId: dto.target_blood_bank_id || fallbackBank.id,
    targetBloodBank: fallbackBank,
    bloodGroup: dto.blood_type as BloodGroup,
    component: (dto.component as any) || "red_cells",
    quantity: qty,
    urgency: normalizeUrgency(dto.urgency),
    requiredAt: dto.created_at,
    reason: dto.notes || "Clinical Requisition",
    notes: dto.notes || undefined,
    status: normalizeBackendRequestStatus(dto.status),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.hospital_id,
    history: [],
    documents: [],
    patientName: dto.patient_name || "كريم أحمد الصاوي",
    medicalRecordNumber: dto.medical_record_number || `#MED-${dto.id.slice(-4).toUpperCase()}`,
    department: "العناية المركزة الجراحية (SICU)",
    attendingDoctor: "د. أحمد كمال (استشاري الجراحة والطوارئ)",
    unitPrice: unitP,
    totalAmount: totalAmt,
    paymentStatus: dto.status === "completed" ? "paid" : "pending",
    trackingReference: dto.tracking_reference || `SEC-REQ-${dto.id.replace("REQ-", "").replace("BR-", "")}-EGY`,
  };
}

export const requestsApi = {
  async getRequests(filters?: Partial<RequestFilters>): Promise<HospitalRequest[]> {
    const params: Record<string, string> = {};
    if (filters?.bloodGroup && filters.bloodGroup !== "all") {
      params.blood_type = filters.bloodGroup;
    }
    if (filters?.urgency && filters.urgency !== "all") {
      params.urgency = filters.urgency;
    }
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status;
    }

    const { data } = await apiClient.get<BackendBloodRequestDTO[]>("/requests", { params });
    return data.map((dto) => mapBackendDtoToHospitalRequest(dto));
  },

  async getRequestById(id: string): Promise<HospitalRequest> {
    const { data } = await apiClient.get<BackendBloodRequestDTO>(`/requests/${id}`);
    return mapBackendDtoToHospitalRequest(data);
  },

  async createRequest(input: HospitalRequestInput): Promise<HospitalRequest> {
    const payload = {
      blood_type: input.bloodGroup,
      component: input.component || "whole_blood",
      quantity_units: input.quantity,
      urgency: input.urgency === "emergency" || input.urgency === "urgent",
      target_blood_bank_id: input.bloodBankId || null,
      notes: input.notes || input.reason || null,
      reason: input.reason || "Clinical Requisition",
      required_by: input.requiredAt ? new Date(input.requiredAt).toISOString() : null,
    };

    const { data } = await apiClient.post<BackendBloodRequestDTO>("/requests", payload);
    return mapBackendDtoToHospitalRequest(data);
  },

  async acceptRequest(id: string, unitPrice: number): Promise<HospitalRequest> {
    const { data } = await apiClient.post<BackendBloodRequestDTO>(`/requests/${id}/accept`, {
      unit_price: unitPrice,
    });
    return mapBackendDtoToHospitalRequest(data);
  },

  async rejectRequest(id: string, reason: string): Promise<HospitalRequest> {
    const { data } = await apiClient.post<BackendBloodRequestDTO>(`/requests/${id}/reject`, {
      reason,
    });
    return mapBackendDtoToHospitalRequest(data);
  },

  async allocateBag(id: string, barcode: string): Promise<{ request: HospitalRequest; bag: any }> {
    const { data } = await apiClient.post<{ request: BackendBloodRequestDTO; bag: any }>(
      `/requests/${id}/allocate-bag`,
      { barcode },
    );
    return {
      request: mapBackendDtoToHospitalRequest(data.request),
      bag: data.bag,
    };
  },

  async deallocateBag(id: string, barcode: string, reason?: string): Promise<{ request: HospitalRequest }> {
    const { data } = await apiClient.post<{ request: BackendBloodRequestDTO }>(
      `/requests/${id}/deallocate-bag`,
      { barcode, reason: reason || "Deallocated by operator" },
    );
    return {
      request: mapBackendDtoToHospitalRequest(data.request),
    };
  },

  async dispatchRequest(id: string): Promise<HospitalRequest> {
    const { data } = await apiClient.post<BackendBloodRequestDTO>(`/requests/${id}/dispatch`);
    return mapBackendDtoToHospitalRequest(data);
  },

  async receiveRequest(id: string): Promise<HospitalRequest> {
    const { data } = await apiClient.post<BackendBloodRequestDTO>(`/requests/${id}/receive`);
    return mapBackendDtoToHospitalRequest(data);
  },

  async cancelRequest(id: string, reason?: string): Promise<HospitalRequest> {
    const { data } = await apiClient.post<BackendBloodRequestDTO>(`/requests/${id}/cancel`, {
      reason: reason || "Cancelled by user",
    });
    return mapBackendDtoToHospitalRequest(data);
  },

  async getRequestTimeline(id: string): Promise<RequestHistoryEvent[]> {
    const { data } = await apiClient.get<BackendTimelineEventDTO[]>(`/requests/${id}/timeline`);
    return data.map((evt) => ({
      id: evt.id,
      status: normalizeBackendRequestStatus(evt.to_status),
      occurredAt: evt.created_at,
      actor: evt.changed_by || "System",
      note: evt.reason || undefined,
    }));
  },

  async getRequestQR(
    id: string,
  ): Promise<{ reference: string; qr_payload: string; request_id: string }> {
    try {
      const { data } = await apiClient.post<{
        reference: string;
        qr_payload: string;
        request_id: string;
      }>(`/requests/${id}/qr`);
      return data;
    } catch {
      return {
        reference: `SEC-REQ-${id.replace("REQ-", "").replace("BR-", "")}-EGY`,
        qr_payload: id,
        request_id: id,
      };
    }
  },

  async getBloodBankRequests(): Promise<BloodBankRequest[]> {
    const { data } = await apiClient.get<any[]>("/requests");
    return Array.isArray(data) ? data.map(mapBackendDtoToBloodBankRequest) : [];
  },

  async getBloodBankRequestById(id: string): Promise<BloodBankRequest> {
    const { data } = await apiClient.get<any>(`/requests/${id}`);
    return mapBackendDtoToBloodBankRequest(data);
  },
};

export function mapBackendDtoToBloodBankRequest(dto: any): BloodBankRequest {
  let qStatus: BloodBankQueueStatus = "submitted";
  const st = (dto.status || "submitted").toLowerCase();
  if (st === "requested" || st === "submitted") qStatus = "submitted";
  else if (st === "acknowledged") qStatus = "acknowledged";
  else if (st === "confirmed") qStatus = "confirmed";
  else if (st === "prepared" || st === "preparing") qStatus = "preparing";
  else if (st === "completed" || st === "dispatched" || st === "delivered") qStatus = "completed";
  else if (st === "cancelled") qStatus = "cancelled";
  else if (st === "rejected") qStatus = "rejected";

  return {
    id: dto.id || dto.blood_request_id,
    hospital: {
      id: dto.hospital_id || "hospital-01",
      name: dto.hospital_name || "Al-Qasr Al-Aini Hospital",
      facilityCode: "HOSP-01",
    },
    bloodGroup: (dto.blood_type || "O+") as BloodGroup,
    component: (dto.component as BloodBankComponent) || "red_cells",
    quantity: dto.quantity_units || dto.requested_quantity || 1,
    urgency: normalizeUrgency(dto.urgency),
    status: qStatus,
    createdAt: dto.created_at || new Date().toISOString(),
    requiredAt: dto.required_by || dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at || dto.created_at || new Date().toISOString(),
    reasonCategory: "Clinical Requisition",
    clinicalReason: dto.reason || dto.notes || "Clinical blood requirement",
    notes: dto.notes || undefined,
    history: [],
    documents: [],
    allocatedUnitIds: dto.allocated_bags || [],
  };
}
