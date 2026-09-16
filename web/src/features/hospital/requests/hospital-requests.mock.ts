import type {
  HospitalDocumentItem,
  HospitalRequest,
  HospitalRequestInput,
  SupportingDocument,
  TargetBloodBank,
} from "@/features/hospital/types/hospital.types";

export const availableBloodBanks: TargetBloodBank[] = [
  {
    id: "central-blood-bank",
    name: "Central Blood Bank",
    facilityCode: "CBB-001",
    governorate: "Cairo",
    address: "5 Al-Bustan St, Bab El-Louk, Cairo",
    phone: "+20 2 2392 7800",
    status: "active",
    availabilitySummary: {
      totalAvailable: 288,
      posture: "warning",
      lowStockGroupsCount: 2,
    },
  },
  {
    id: "nile-regional-blood-bank",
    name: "Nile Regional Blood Bank",
    facilityCode: "NRB-002",
    governorate: "Giza",
    address: "8 Mourad St, Giza",
    phone: "+20 2 3572 4430",
    status: "active",
    availabilitySummary: {
      totalAvailable: 142,
      posture: "optimal",
      lowStockGroupsCount: 0,
    },
  },
  {
    id: "alex-central-blood-bank",
    name: "Alexandria Coastal Blood Bank",
    facilityCode: "ACB-003",
    governorate: "Alexandria",
    address: "22 Sultan Hussein St, Al-Azarita, Alexandria",
    phone: "+20 3 4861 200",
    status: "active",
    availabilitySummary: {
      totalAvailable: 96,
      posture: "optimal",
      lowStockGroupsCount: 1,
    },
  },
  {
    id: "delta-auxiliary-bank",
    name: "Delta Auxiliary Blood Depot",
    facilityCode: "DAB-004",
    governorate: "Gharbia",
    address: "El-Geish St, Tanta",
    phone: "+20 40 3341 800",
    status: "inactive",
    availabilitySummary: {
      totalAvailable: 0,
      posture: "critical",
      lowStockGroupsCount: 8,
    },
  },
];

const initialRequests: HospitalRequest[] = [
  {
    id: "BR-2026-1049",
    bloodBankId: "central-blood-bank",
    targetBloodBank: availableBloodBanks[0],
    bloodGroup: "B−",
    component: "red_cells",
    quantity: 3,
    urgency: "urgent",
    requiredAt: "2026-09-08T18:00:00+03:00",
    reason: "Severe trauma anemia stabilization",
    notes: "Requires compatible B-negative packed red cells for emergency surgical bed 3.",
    status: "rejected",
    createdAt: "2026-09-08T06:30:00+03:00",
    updatedAt: "2026-09-08T07:15:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1049-1",
        status: "submitted",
        occurredAt: "2026-09-08T06:30:00+03:00",
        actor: "Ahmed Hospital User",
        note: "Request submitted to Central Blood Bank.",
      },
      {
        id: "evt-1049-2",
        status: "rejected",
        occurredAt: "2026-09-08T07:15:00+03:00",
        actor: "Central Blood Bank",
        note: "Rejection: Zero compatible B-negative units available in Central stock. Re-routing to Nile Regional Blood Bank is advised.",
      },
    ],
    documents: [
      {
        id: "doc-1049-1",
        name: "trauma-triage-assessment.pdf",
        sizeBytes: 310_000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T06:32:00+03:00",
        reviewStatus: "accepted",
      },
    ],
  },
  {
    id: "BR-2026-1048",
    bloodBankId: "nile-regional-blood-bank",
    targetBloodBank: availableBloodBanks[1],
    bloodGroup: "O−",
    component: "red_cells",
    quantity: 4,
    urgency: "emergency",
    requiredAt: "2026-09-08T10:30:00+03:00",
    reason: "Emergency surgical hemorrhage protocol",
    notes: "Operating theatre 4. Clinical identifiers remain in the EHR.",
    status: "preparing",
    createdAt: "2026-09-08T08:14:00+03:00",
    updatedAt: "2026-09-08T09:02:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1048-1",
        status: "submitted",
        occurredAt: "2026-09-08T08:14:00+03:00",
        actor: "Ahmed Hospital User",
        note: "Request submitted to the assigned blood bank.",
      },
      {
        id: "evt-1048-2",
        status: "acknowledged",
        occurredAt: "2026-09-08T08:22:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
      {
        id: "evt-1048-3",
        status: "confirmed",
        occurredAt: "2026-09-08T08:41:00+03:00",
        actor: "Nile Regional Blood Bank",
        note: "Four compatible units allocated.",
      },
      {
        id: "evt-1048-4",
        status: "preparing",
        occurredAt: "2026-09-08T09:02:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
    ],
    documents: [
      {
        id: "doc-1048-1",
        name: "emergency-release-form.pdf",
        sizeBytes: 842_100,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T08:16:00+03:00",
        reviewStatus: "accepted",
      },
    ],
  },
  {
    id: "BR-2026-1047",
    bloodBankId: "nile-regional-blood-bank",
    targetBloodBank: availableBloodBanks[1],
    bloodGroup: "A+",
    component: "platelets",
    quantity: 2,
    urgency: "urgent",
    requiredAt: "2026-09-08T14:00:00+03:00",
    reason: "Thrombocytopenia with active bleeding",
    status: "confirmed",
    createdAt: "2026-09-08T07:42:00+03:00",
    updatedAt: "2026-09-08T08:35:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1047-1",
        status: "submitted",
        occurredAt: "2026-09-08T07:42:00+03:00",
        actor: "Ahmed Hospital User",
      },
      {
        id: "evt-1047-2",
        status: "acknowledged",
        occurredAt: "2026-09-08T07:55:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
      {
        id: "evt-1047-3",
        status: "confirmed",
        occurredAt: "2026-09-08T08:35:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
    ],
    documents: [],
  },
  {
    id: "BR-2026-1046",
    bloodBankId: "central-blood-bank",
    targetBloodBank: availableBloodBanks[0],
    bloodGroup: "B+",
    component: "fresh_frozen_plasma",
    quantity: 3,
    urgency: "routine",
    requiredAt: "2026-09-09T09:00:00+03:00",
    reason: "Planned liver procedure",
    status: "acknowledged",
    createdAt: "2026-09-07T16:18:00+03:00",
    updatedAt: "2026-09-08T07:20:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1046-1",
        status: "submitted",
        occurredAt: "2026-09-07T16:18:00+03:00",
        actor: "Ahmed Hospital User",
      },
      {
        id: "evt-1046-2",
        status: "acknowledged",
        occurredAt: "2026-09-08T07:20:00+03:00",
        actor: "Central Blood Bank",
      },
    ],
    documents: [
      {
        id: "doc-1046-1",
        name: "consultant-request.pdf",
        sizeBytes: 516_400,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-07T16:22:00+03:00",
        reviewStatus: "pending",
      },
    ],
  },
  {
    id: "BR-2026-1045",
    bloodBankId: "alex-central-blood-bank",
    targetBloodBank: availableBloodBanks[2],
    bloodGroup: "AB+",
    component: "red_cells",
    quantity: 2,
    urgency: "routine",
    requiredAt: "2026-09-09T12:00:00+03:00",
    reason: "Pre-operative anemia management",
    status: "submitted",
    createdAt: "2026-09-07T14:08:00+03:00",
    updatedAt: "2026-09-07T14:08:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1045-1",
        status: "submitted",
        occurredAt: "2026-09-07T14:08:00+03:00",
        actor: "Ahmed Hospital User",
      },
    ],
    documents: [],
  },
  {
    id: "BR-2026-1044",
    bloodBankId: "nile-regional-blood-bank",
    targetBloodBank: availableBloodBanks[1],
    bloodGroup: "O+",
    component: "whole_blood",
    quantity: 2,
    urgency: "urgent",
    requiredAt: "2026-09-07T18:00:00+03:00",
    reason: "Postpartum hemorrhage response",
    status: "completed",
    createdAt: "2026-09-07T11:32:00+03:00",
    updatedAt: "2026-09-07T17:24:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1044-1",
        status: "submitted",
        occurredAt: "2026-09-07T11:32:00+03:00",
        actor: "Ahmed Hospital User",
      },
      {
        id: "evt-1044-2",
        status: "acknowledged",
        occurredAt: "2026-09-07T11:40:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
      {
        id: "evt-1044-3",
        status: "confirmed",
        occurredAt: "2026-09-07T12:03:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
      {
        id: "evt-1044-4",
        status: "preparing",
        occurredAt: "2026-09-07T12:30:00+03:00",
        actor: "Nile Regional Blood Bank",
      },
      {
        id: "evt-1044-5",
        status: "completed",
        occurredAt: "2026-09-07T17:24:00+03:00",
        actor: "Ahmed Hospital User",
        note: "Handoff confirmed by the receiving hospital.",
      },
    ],
    documents: [],
  },
  {
    id: "BR-2026-1043",
    bloodBankId: "nile-regional-blood-bank",
    targetBloodBank: availableBloodBanks[1],
    bloodGroup: "A−",
    component: "red_cells",
    quantity: 1,
    urgency: "routine",
    requiredAt: "2026-09-10T08:00:00+03:00",
    reason: "Scheduled orthopedic procedure",
    status: "draft",
    createdAt: "2026-09-07T09:50:00+03:00",
    updatedAt: "2026-09-07T09:50:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [],
    documents: [],
  },
  {
    id: "BR-2026-1042",
    bloodBankId: "nile-regional-blood-bank",
    targetBloodBank: availableBloodBanks[1],
    bloodGroup: "B−",
    component: "cryoprecipitate",
    quantity: 4,
    urgency: "urgent",
    requiredAt: "2026-09-07T15:00:00+03:00",
    reason: "Acquired hypofibrinogenemia",
    status: "cancelled",
    createdAt: "2026-09-06T18:26:00+03:00",
    updatedAt: "2026-09-07T08:10:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1042-1",
        status: "submitted",
        occurredAt: "2026-09-06T18:26:00+03:00",
        actor: "Ahmed Hospital User",
      },
      {
        id: "evt-1042-2",
        status: "cancelled",
        occurredAt: "2026-09-07T08:10:00+03:00",
        actor: "Ahmed Hospital User",
        note: "Clinical need resolved before allocation.",
      },
    ],
    documents: [],
  },
  {
    id: "BR-2026-1041",
    bloodBankId: "central-blood-bank",
    targetBloodBank: availableBloodBanks[0],
    bloodGroup: "AB−",
    component: "platelets",
    quantity: 1,
    urgency: "routine",
    requiredAt: "2026-09-08T16:00:00+03:00",
    reason: "Oncology treatment support",
    status: "completed",
    createdAt: "2026-09-06T13:05:00+03:00",
    updatedAt: "2026-09-08T08:05:00+03:00",
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: "evt-1041-1",
        status: "submitted",
        occurredAt: "2026-09-06T13:05:00+03:00",
        actor: "Ahmed Hospital User",
      },
      {
        id: "evt-1041-2",
        status: "completed",
        occurredAt: "2026-09-08T08:05:00+03:00",
        actor: "Ahmed Hospital User",
      },
    ],
    documents: [],
  },
];

let requests = structuredClone(initialRequests);

function wait(duration = 260) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export async function getHospitalRequests() {
  await wait();
  return structuredClone(requests);
}

export async function getAvailableBloodBanks() {
  await wait(120);
  return structuredClone(availableBloodBanks);
}

export async function getHospitalRequest(id: string) {
  await wait(180);
  return structuredClone(requests.find((request) => request.id === id) ?? null);
}

export async function createHospitalRequest(
  input: HospitalRequestInput,
  shouldFail = false,
) {
  await wait(700);

  if (shouldFail) {
    throw new Error(
      "The demonstration service could not save this request. Review the information and try again.",
    );
  }

  const targetBloodBank =
    availableBloodBanks.find((b) => b.id === input.bloodBankId) ??
    availableBloodBanks[0];

  const timestamp = new Date().toISOString();
  const request: HospitalRequest = {
    ...input,
    id: `BR-2026-${1050 + requests.length}`,
    targetBloodBank,
    status: "submitted",
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: "Ahmed Hospital User",
    history: [
      {
        id: `evt-created-${crypto.randomUUID()}`,
        status: "submitted",
        occurredAt: timestamp,
        actor: "Ahmed Hospital User",
        note: `Request submitted to ${targetBloodBank.name}.`,
      },
    ],
    documents: [],
  };

  requests = [request, ...requests];
  return structuredClone(request);
}

export async function rerouteHospitalRequest(
  requestId: string,
  newBloodBankId: string,
  notes?: string,
): Promise<HospitalRequest> {
  await wait(450);

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex < 0) {
    throw new Error("Request not found in the hospital repository.");
  }

  const current = requests[reqIndex];
  const newTargetBank =
    availableBloodBanks.find((b) => b.id === newBloodBankId) ??
    availableBloodBanks[0];

  const timestamp = new Date().toISOString();
  const noteText = notes?.trim()
    ? `Re-routed to ${newTargetBank.name}. Clinician rationale: ${notes.trim()}`
    : `Re-routed to alternative facility ${newTargetBank.name} following previous rejection.`;

  const updated: HospitalRequest = {
    ...current,
    bloodBankId: newBloodBankId,
    targetBloodBank: newTargetBank,
    status: "submitted",
    updatedAt: timestamp,
    history: [
      ...current.history,
      {
        id: `evt-reroute-${crypto.randomUUID()}`,
        status: "submitted",
        occurredAt: timestamp,
        actor: "Ahmed Hospital User",
        note: noteText,
      },
    ],
  };

  requests = requests.map((r, i) => (i === reqIndex ? updated : r));
  return structuredClone(updated);
}

export async function getHospitalAllDocuments(): Promise<HospitalDocumentItem[]> {
  await wait(220);
  const items: HospitalDocumentItem[] = [];

  for (const req of requests) {
    for (const doc of req.documents) {
      items.push({
        ...doc,
        requestId: req.id,
        bloodGroup: req.bloodGroup,
        component: req.component,
        urgency: req.urgency,
        targetBloodBankName: req.targetBloodBank.name,
      });
    }
  }

  // Sort newest uploaded first
  return items.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function uploadHospitalDocumentToRequest(
  requestId: string,
  file: { name: string; sizeBytes: number; mimeType: string },
): Promise<{ request: HospitalRequest; document: HospitalDocumentItem }> {
  await wait(500);

  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex < 0) {
    throw new Error("Target requisition not found.");
  }

  const current = requests[reqIndex];
  const timestamp = new Date().toISOString();
  const newDoc: SupportingDocument = {
    id: `doc-${Date.now()}`,
    name: file.name,
    sizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
    uploadedAt: timestamp,
    reviewStatus: "pending",
    source: "local_preview",
  };

  const updated: HospitalRequest = {
    ...current,
    updatedAt: timestamp,
    documents: [...current.documents, newDoc],
    history: [
      ...current.history,
      {
        id: `evt-doc-${crypto.randomUUID()}`,
        status: current.status,
        occurredAt: timestamp,
        actor: "Ahmed Hospital User",
        note: `Attached supporting document: ${file.name}.`,
      },
    ],
  };

  requests = requests.map((r, i) => (i === reqIndex ? updated : r));

  const docItem: HospitalDocumentItem = {
    ...newDoc,
    requestId: updated.id,
    bloodGroup: updated.bloodGroup,
    component: updated.component,
    urgency: updated.urgency,
    targetBloodBankName: updated.targetBloodBank.name,
  };

  return { request: structuredClone(updated), document: docItem };
}
