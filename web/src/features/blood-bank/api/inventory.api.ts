import { apiClient } from "@/shared/api/http-client";
import type {
  BloodUnit,
  BloodUnitStatus,
  BloodBankComponent,
  CustodyEvent,
  InventoryLedgerFilters,
  BloodUnitIntakePayload,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

export interface BackendInventoryItemDTO {
  id: string;
  blood_bank_id: string;
  blood_type: string;
  component: string;
  barcode: string;
  status: string;
  volume_ml?: number;
  storage_location?: string | null;
  collection_date: string;
  expiry_date: string;
  reserved_for_request_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendBagHistoryDTO {
  id: string;
  bag_id: string;
  from_status?: string | null;
  to_status: string;
  action: string;
  changed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

export function mapBackendDtoToBloodUnit(dto: any): BloodUnit {
  let status: BloodUnitStatus;
  const rawStatus = dto?.status ?? (dto?.is_available ? "available" : "quarantined");
  const st = String(rawStatus).toLowerCase();
  if (st === "allocated") status = "allocated";
  else if (st === "reserved") status = "reserved";
  else if (st === "quarantine" || st === "quarantined") status = "quarantined";
  else if (st === "expired" || st === "discarded") status = "expired";
  else status = "available";

  return {
    id: dto.qr_code || dto.barcode || dto.id || `UNT-${Date.now().toString().slice(-6)}`,
    bloodGroup: (dto.blood_type || dto.bloodGroup || "O+") as BloodGroup,
    component: (dto.component as BloodBankComponent) || "red_cells",
    collectionDate: dto.collection_date ? String(dto.collection_date).split("T")[0] : new Date().toISOString().split("T")[0],
    expiryDate: dto.expiry_date ? String(dto.expiry_date).split("T")[0] : new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
    storageLocation: dto.current_location || dto.storage_location || "Central Storage Rack",
    status,
    allocatedRequestId: dto.allocated_request_id || dto.reserved_for_request_id || undefined,
    registeredAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at || dto.last_updated || new Date().toISOString(),
    notes: dto.volume_ml ? `Volume: ${dto.volume_ml} mL` : undefined,
  };
}

export const inventoryApi = {
  async getInventory(filters?: Partial<InventoryLedgerFilters>): Promise<BloodUnit[]> {
    const params: Record<string, string> = {};
    if (filters?.bloodGroup && filters.bloodGroup !== "all") {
      params.blood_type = filters.bloodGroup;
    }
    if (filters?.component && filters.component !== "all") {
      params.component = filters.component;
    }
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status;
    }

    try {
      const { data } = await apiClient.get<any[]>("/blood-bags", { params });
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendDtoToBloodUnit);
      }
    } catch {
      // fallback to /inventory
    }

    try {
      const { data } = await apiClient.get<any[]>("/inventory", { params });
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendDtoToBloodUnit);
      }
    } catch {
      // return empty array if both fail
    }
    return [];
  },

  async registerUnit(payload: BloodUnitIntakePayload): Promise<BloodUnit> {
    const body = {
      blood_type: payload.bloodGroup,
      component: payload.component,
      quantity: 1,
      collection_date: payload.collectionDate,
      expiry_date: payload.expiryDate,
      current_location: payload.storageLocation || "Central Agitator Bay",
    };

    try {
      const { data } = await apiClient.post<any>("/blood-bags", body);
      return mapBackendDtoToBloodUnit(data);
    } catch {
      const fallbackBody = {
        blood_bank_id: "default",
        blood_type: payload.bloodGroup,
        component: payload.component,
        quantity_units: 1,
        expiry_date: payload.expiryDate ? new Date(payload.expiryDate).toISOString() : null,
      };
      const { data } = await apiClient.post<any>("/inventory", fallbackBody);
      return mapBackendDtoToBloodUnit(data);
    }
  },

  async updateUnitStatus(unitId: string, status: BloodUnitStatus, notes?: string, location?: string): Promise<BloodUnit> {
    try {
      const { data } = await apiClient.patch<any>(`/blood-bags/${unitId}/status`, {
        status,
        notes,
        location,
      });
      return mapBackendDtoToBloodUnit(data);
    } catch {
      const { data } = await apiClient.patch<any>(`/inventory/${unitId}`, {
        is_available: status === "available",
      });
      return mapBackendDtoToBloodUnit(data);
    }
  },

  async getInventoryStats(): Promise<any> {
    const { data } = await apiClient.get("/inventory/stats");
    return data;
  },

  async getBagCustodyHistory(bagId: string): Promise<CustodyEvent[]> {
    const { data } = await apiClient.get<BackendBagHistoryDTO[]>(`/blood-bags/${bagId}/history`);
    return data.map((dto) => ({
      id: dto.id,
      event: (dto.action.toLowerCase() as any) || "allocated",
      title: `${dto.action.replace("_", " ")}: ${dto.to_status}`,
      timestamp: dto.created_at,
      location: "Central Facility",
      actor: dto.changed_by || "Lab Staff",
      role: "Blood Bank Operator",
      notes: dto.notes || undefined,
    }));
  },

  async getBagByBarcode(barcode: string): Promise<BloodUnit> {
    const { data } = await apiClient.get<BackendInventoryItemDTO>(`/blood-bags/barcode/${barcode}`);
    return mapBackendDtoToBloodUnit(data);
  },
};
