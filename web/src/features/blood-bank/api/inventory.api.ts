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

export function mapBackendDtoToBloodUnit(dto: BackendInventoryItemDTO): BloodUnit {
  let status: BloodUnitStatus = "available";
  const st = dto.status.toLowerCase();
  if (st === "allocated") status = "allocated";
  else if (st === "reserved") status = "reserved";
  else if (st === "quarantine" || st === "quarantined") status = "quarantined";
  else if (st === "expired" || st === "discarded") status = "expired";
  else status = "available";

  return {
    id: dto.barcode || dto.id,
    bloodGroup: dto.blood_type as BloodGroup,
    component: (dto.component as BloodBankComponent) || "red_cells",
    collectionDate: dto.collection_date ? dto.collection_date.split("T")[0] : "",
    expiryDate: dto.expiry_date,
    storageLocation: dto.storage_location || "Central Storage Rack",
    status,
    allocatedRequestId: dto.reserved_for_request_id || undefined,
    registeredAt: dto.created_at,
    updatedAt: dto.updated_at,
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

    const { data } = await apiClient.get<BackendInventoryItemDTO[]>("/inventory", { params });
    return data.map(mapBackendDtoToBloodUnit);
  },

  async registerUnit(payload: BloodUnitIntakePayload): Promise<BloodUnit> {
    const barcode = payload.unitId || `UNT-${payload.bloodGroup.replace("+", "POS").replace("−", "NEG")}-${Date.now().toString().slice(-6)}`;
    const body = {
      blood_type: payload.bloodGroup,
      component: payload.component,
      barcode,
      volume_ml: 450,
      storage_location: payload.storageLocation || "Central Agitator Bay",
      collection_date: new Date(payload.collectionDate).toISOString(),
      expiry_date: new Date(payload.expiryDate).toISOString(),
    };

    const { data } = await apiClient.post<BackendInventoryItemDTO>("/inventory", body);
    return mapBackendDtoToBloodUnit(data);
  },

  async updateUnitStatus(unitId: string, status: BloodUnitStatus, notes?: string): Promise<BloodUnit> {
    const { data } = await apiClient.patch<BackendInventoryItemDTO>(`/inventory/${unitId}/status`, {
      status,
      notes,
    });
    return mapBackendDtoToBloodUnit(data);
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
