import {
  allocateUnitsInSharedStore,
  deallocateUnitInSharedStore,
  getSharedBloodUnitsDirect,
  reserveUnitsInSharedStore,
  resetInventoryMock,
} from "@/features/blood-bank/inventory/inventory.mock";
import type {
  BloodBankDocumentItem,
  BloodBankOperationalSnapshot,
  BloodBankQueueStatus,
  BloodBankRequest,
  BloodBankRequestAction,
  BloodUnit,
  BloodUnitStatus,
  DocumentReviewStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

const mockLatency = 320;

const hospitals = {
  cairoGeneral: {
    id: "hospital-cairo-general",
    name: "Cairo General Hospital",
    facilityCode: "CGH-014",
  },
  nileSpecialist: {
    id: "hospital-nile-specialist",
    name: "Nile Specialist Hospital",
    facilityCode: "NSH-027",
  },
  alShifa: {
    id: "hospital-al-shifa",
    name: "Al Shifa Medical Center",
    facilityCode: "ASM-032",
  },
  childrens: {
    id: "hospital-childrens",
    name: "Children's Medical Hospital",
    facilityCode: "CMH-008",
  },
  october: {
    id: "hospital-october",
    name: "October University Hospital",
    facilityCode: "OUH-041",
  },
} as const;

const initialRequests: BloodBankRequest[] = [
  {
    id: "BR-2026-2194",
    hospital: hospitals.cairoGeneral,
    bloodGroup: "O−",
    component: "red_cells",
    quantity: 6,
    urgency: "emergency",
    status: "submitted",
    createdAt: "2026-09-08T07:42:00+03:00",
    requiredAt: "2026-09-08T09:00:00+03:00",
    updatedAt: "2026-09-08T07:42:00+03:00",
    reasonCategory: "Emergency hemorrhage support",
    clinicalReason:
      "Severe acute hemorrhage post-trauma in emergency resuscitation unit. Immediate transfusion protocol initiated.",
    notes:
      "Crossmatch waiver requested due to critical timeline. Release uncrossmatched O-negative units if needed.",
    history: [
      {
        id: "event-2194-1",
        status: "submitted",
        occurredAt: "2026-09-08T07:42:00+03:00",
        actor: "Cairo General Hospital",
        note: "Emergency request entered into the demonstration queue.",
      },
    ],
    documents: [
      {
        id: "doc-2194-1",
        name: "emergency-release-authorization.pdf",
        sizeBytes: 248100,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T07:43:00+03:00",
        reviewStatus: "accepted",
      },
      {
        id: "doc-2194-2",
        name: "patient-antibody-screen.pdf",
        sizeBytes: 182400,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T07:44:00+03:00",
        reviewStatus: "pending",
      },
    ],
    allocatedUnitIds: [],
  },
  {
    id: "BR-2026-2193",
    hospital: hospitals.childrens,
    bloodGroup: "A+",
    component: "platelets",
    quantity: 3,
    urgency: "urgent",
    status: "acknowledged",
    createdAt: "2026-09-08T07:18:00+03:00",
    requiredAt: "2026-09-08T11:30:00+03:00",
    updatedAt: "2026-09-08T07:31:00+03:00",
    reasonCategory: "Pediatric oncology support",
    clinicalReason:
      "Thrombocytopenia secondary to intensive chemotherapy. Prophylactic transfusion before central line placement.",
    notes: "Irradiated and leukoreduced units preferred.",
    history: [
      {
        id: "event-2193-1",
        status: "submitted",
        occurredAt: "2026-09-08T07:18:00+03:00",
        actor: "Children's Medical Hospital",
      },
      {
        id: "event-2193-2",
        status: "acknowledged",
        occurredAt: "2026-09-08T07:31:00+03:00",
        actor: "Central Blood Bank",
      },
    ],
    documents: [
      {
        id: "doc-2193-1",
        name: "oncology-platelet-requisition.pdf",
        sizeBytes: 195000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T07:19:00+03:00",
        reviewStatus: "accepted",
      },
    ],
    allocatedUnitIds: [],
  },
  {
    id: "BR-2026-2192",
    hospital: hospitals.nileSpecialist,
    bloodGroup: "B+",
    component: "fresh_frozen_plasma",
    quantity: 4,
    urgency: "urgent",
    status: "confirmed",
    createdAt: "2026-09-08T06:54:00+03:00",
    requiredAt: "2026-09-08T12:00:00+03:00",
    updatedAt: "2026-09-08T07:36:00+03:00",
    reasonCategory: "Surgical transfusion support",
    clinicalReason:
      "Complex cardiovascular surgery with anticipated coagulopathy. Plasma required for volume and factor replacement.",
    notes: "Units should be thawed and ready for courier pickup by 11:45.",
    history: [
      {
        id: "event-2192-1",
        status: "submitted",
        occurredAt: "2026-09-08T06:54:00+03:00",
        actor: "Nile Specialist Hospital",
      },
      {
        id: "event-2192-2",
        status: "acknowledged",
        occurredAt: "2026-09-08T07:09:00+03:00",
        actor: "Central Blood Bank",
      },
      {
        id: "event-2192-3",
        status: "confirmed",
        occurredAt: "2026-09-08T07:36:00+03:00",
        actor: "Central Blood Bank",
        note: "2 units allocated and availability confirmed.",
      },
    ],
    documents: [
      {
        id: "doc-2192-1",
        name: "surgical-transfusion-order.pdf",
        sizeBytes: 312000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-08T06:55:00+03:00",
        reviewStatus: "accepted",
      },
    ],
    allocatedUnitIds: ["UNT-B-POS-0331", "UNT-B-POS-0332"],
  },
  {
    id: "BR-2026-2191",
    hospital: hospitals.alShifa,
    bloodGroup: "AB+",
    component: "red_cells",
    quantity: 2,
    urgency: "routine",
    status: "preparing",
    createdAt: "2026-09-07T16:26:00+03:00",
    requiredAt: "2026-09-08T14:00:00+03:00",
    updatedAt: "2026-09-08T07:15:00+03:00",
    reasonCategory: "Scheduled procedure",
    clinicalReason:
      "Elective total knee arthroplasty in an elderly patient with hemoglobin 8.8 g/dL.",
    notes: "Compatible with AB+ or A+ packed cells if AB+ unavailable.",
    history: [
      {
        id: "event-2191-1",
        status: "submitted",
        occurredAt: "2026-09-07T16:26:00+03:00",
        actor: "Al Shifa Medical Center",
      },
      {
        id: "event-2191-2",
        status: "acknowledged",
        occurredAt: "2026-09-07T16:48:00+03:00",
        actor: "Central Blood Bank",
      },
      {
        id: "event-2191-3",
        status: "confirmed",
        occurredAt: "2026-09-07T17:02:00+03:00",
        actor: "Central Blood Bank",
      },
      {
        id: "event-2191-4",
        status: "preparing",
        occurredAt: "2026-09-08T07:15:00+03:00",
        actor: "Central Blood Bank",
        note: "Crossmatch testing and packing initiated.",
      },
    ],
    documents: [
      {
        id: "doc-2191-1",
        name: "preoperative-crossmatch-request.pdf",
        sizeBytes: 198000,
        mimeType: "application/pdf",
        uploadedAt: "2026-09-07T16:30:00+03:00",
        reviewStatus: "accepted",
      },
    ],
    allocatedUnitIds: ["UNT-AB-POS-0451", "UNT-AB-POS-0452"],
  },
  {
    id: "BR-2026-2190",
    hospital: hospitals.october,
    bloodGroup: "O+",
    component: "whole_blood",
    quantity: 5,
    urgency: "urgent",
    status: "completed",
    createdAt: "2026-09-07T14:10:00+03:00",
    requiredAt: "2026-09-07T19:00:00+03:00",
    updatedAt: "2026-09-07T18:22:00+03:00",
    reasonCategory: "Trauma support",
    clinicalReason:
      "Multiple blunt trauma resuscitation following highway motor vehicle collision.",
    notes: "Courier transport dispatch completed.",
    history: [
      {
        id: "event-2190-1",
        status: "submitted",
        occurredAt: "2026-09-07T14:10:00+03:00",
        actor: "October University Hospital",
      },
      {
        id: "event-2190-2",
        status: "completed",
        occurredAt: "2026-09-07T18:22:00+03:00",
        actor: "Central Blood Bank",
        note: "Demonstration handoff completed.",
      },
    ],
    documents: [],
    allocatedUnitIds: [],
  },
  {
    id: "BR-2026-2189",
    hospital: hospitals.cairoGeneral,
    bloodGroup: "A−",
    component: "cryoprecipitate",
    quantity: 8,
    urgency: "routine",
    status: "cancelled",
    createdAt: "2026-09-07T12:44:00+03:00",
    requiredAt: "2026-09-08T10:00:00+03:00",
    updatedAt: "2026-09-07T15:30:00+03:00",
    reasonCategory: "Coagulation support",
    clinicalReason: "Hypofibrinogenemia management prior to scheduled surgery.",
    history: [
      {
        id: "event-2189-1",
        status: "submitted",
        occurredAt: "2026-09-07T12:44:00+03:00",
        actor: "Cairo General Hospital",
      },
      {
        id: "event-2189-2",
        status: "cancelled",
        occurredAt: "2026-09-07T15:30:00+03:00",
        actor: "Cairo General Hospital",
      },
    ],
    documents: [],
    allocatedUnitIds: [],
  },
  {
    id: "BR-2026-2188",
    hospital: hospitals.nileSpecialist,
    bloodGroup: "B−",
    component: "red_cells",
    quantity: 2,
    urgency: "routine",
    status: "rejected",
    createdAt: "2026-09-07T11:05:00+03:00",
    requiredAt: "2026-09-08T08:00:00+03:00",
    updatedAt: "2026-09-07T11:42:00+03:00",
    reasonCategory: "Scheduled procedure",
    clinicalReason:
      "Procedure was cancelled by attending physician; requisition unconfirmed.",
    history: [
      {
        id: "event-2188-1",
        status: "submitted",
        occurredAt: "2026-09-07T11:05:00+03:00",
        actor: "Nile Specialist Hospital",
      },
      {
        id: "event-2188-2",
        status: "rejected",
        occurredAt: "2026-09-07T11:42:00+03:00",
        actor: "Central Blood Bank",
        note: "Demonstration request rejected after eligibility review.",
      },
    ],
    documents: [],
    allocatedUnitIds: [],
  },
  {
    id: "BR-2026-2187",
    hospital: hospitals.childrens,
    bloodGroup: "AB−",
    component: "platelets",
    quantity: 1,
    urgency: "routine",
    status: "completed",
    createdAt: "2026-09-06T15:12:00+03:00",
    requiredAt: "2026-09-07T09:00:00+03:00",
    updatedAt: "2026-09-07T08:38:00+03:00",
    reasonCategory: "Pediatric transfusion support",
    clinicalReason: "Post-bone marrow transplant platelet refractory state.",
    history: [
      {
        id: "event-2187-1",
        status: "submitted",
        occurredAt: "2026-09-06T15:12:00+03:00",
        actor: "Children's Medical Hospital",
      },
      {
        id: "event-2187-2",
        status: "completed",
        occurredAt: "2026-09-07T08:38:00+03:00",
        actor: "Central Blood Bank",
      },
    ],
    documents: [],
    allocatedUnitIds: [],
  },
];

let requests = structuredClone(initialRequests);

const actionTransitions: Record<
  BloodBankRequestAction,
  { from: BloodBankQueueStatus[]; to: BloodBankQueueStatus; note: string }
> = {
  acknowledge: {
    from: ["submitted"],
    to: "acknowledged",
    note: "Request acknowledged in this local preview.",
  },
  confirm: {
    from: ["acknowledged"],
    to: "confirmed",
    note: "Request availability confirmed in this local preview.",
  },
  start_preparation: {
    from: ["confirmed"],
    to: "preparing",
    note: "Preparation started in this local preview.",
  },
  complete: {
    from: ["preparing"],
    to: "completed",
    note: "Request marked complete in this local preview.",
  },
  reject: {
    from: ["submitted", "acknowledged"],
    to: "rejected",
    note: "Request rejected in this local preview.",
  },
};

function waitForMock<T>(value: T) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), mockLatency);
  });
}

export function getAvailableActions(
  request: BloodBankRequest,
): BloodBankRequestAction[] {
  return (Object.keys(actionTransitions) as BloodBankRequestAction[]).filter(
    (action) => actionTransitions[action].from.includes(request.status),
  );
}

export async function getBloodBankRequests() {
  return waitForMock(structuredClone(requests));
}

export async function getBloodBankRequestById(
  id: string,
): Promise<BloodBankRequest | undefined> {
  const found = requests.find((req) => req.id === id);
  return waitForMock(found ? structuredClone(found) : undefined);
}

export async function getBloodUnits(params?: {
  bloodGroup?: BloodGroup;
  status?: BloodUnitStatus;
}): Promise<BloodUnit[]> {
  let result = [...getSharedBloodUnitsDirect()];
  if (params?.bloodGroup) {
    result = result.filter((unit) => unit.bloodGroup === params.bloodGroup);
  }
  if (params?.status) {
    result = result.filter((unit) => unit.status === params.status);
  }
  return waitForMock(structuredClone(result));
}

export async function allocateUnitsToRequest(
  requestId: string,
  unitIds: string[],
): Promise<{ request: BloodBankRequest; units: BloodUnit[] }> {
  const requestIndex = requests.findIndex((req) => req.id === requestId);
  if (requestIndex < 0) {
    throw new Error("Request not found in the demonstration queue.");
  }

  const currentRequest = requests[requestIndex];
  const updatedAllocatedIds = Array.from(
    new Set([...currentRequest.allocatedUnitIds, ...unitIds]),
  );

  const updatedUnits = allocateUnitsInSharedStore(requestId, unitIds);

  const occurredAt = new Date().toISOString();
  const updatedRequest: BloodBankRequest = {
    ...currentRequest,
    allocatedUnitIds: updatedAllocatedIds,
    updatedAt: occurredAt,
    history: [
      ...currentRequest.history,
      {
        id: `event-${requestId}-${currentRequest.history.length + 1}`,
        status: currentRequest.status,
        occurredAt,
        actor: "Mariam Blood Bank User",
        note: `Allocated ${unitIds.length} blood unit(s) (${unitIds.join(", ")}) to this request.`,
      },
    ],
  };

  requests = requests.map((req, idx) =>
    idx === requestIndex ? updatedRequest : req,
  );

  return waitForMock({
    request: structuredClone(updatedRequest),
    units: structuredClone(updatedUnits),
  });
}

export async function reserveUnitsForRequest(
  requestId: string,
  unitIds: string[],
): Promise<{ request: BloodBankRequest; units: BloodUnit[] }> {
  const requestIndex = requests.findIndex((req) => req.id === requestId);
  if (requestIndex < 0) {
    throw new Error("Request not found in the demonstration queue.");
  }

  const currentRequest = requests[requestIndex];
  const updatedAllocatedIds = Array.from(
    new Set([...currentRequest.allocatedUnitIds, ...unitIds]),
  );

  const updatedUnits = reserveUnitsInSharedStore(requestId, unitIds);

  const occurredAt = new Date().toISOString();
  const updatedRequest: BloodBankRequest = {
    ...currentRequest,
    allocatedUnitIds: updatedAllocatedIds,
    updatedAt: occurredAt,
    history: [
      ...currentRequest.history,
      {
        id: `event-${requestId}-${currentRequest.history.length + 1}`,
        status: currentRequest.status,
        occurredAt,
        actor: "Mariam Blood Bank User",
        note: `Reserved ${unitIds.length} blood unit(s) (${unitIds.join(", ")}) for cross-matching.`,
      },
    ],
  };

  requests = requests.map((req, idx) =>
    idx === requestIndex ? updatedRequest : req,
  );

  return waitForMock({
    request: structuredClone(updatedRequest),
    units: structuredClone(updatedUnits),
  });
}

export async function deallocateUnitFromRequest(
  requestId: string,
  unitId: string,
): Promise<{ request: BloodBankRequest; units: BloodUnit[] }> {
  const requestIndex = requests.findIndex((req) => req.id === requestId);
  if (requestIndex < 0) {
    throw new Error("Request not found in the demonstration queue.");
  }

  const currentRequest = requests[requestIndex];
  const updatedAllocatedIds = currentRequest.allocatedUnitIds.filter(
    (id) => id !== unitId,
  );

  const updatedUnits = deallocateUnitInSharedStore(requestId, unitId);

  const occurredAt = new Date().toISOString();
  const updatedRequest: BloodBankRequest = {
    ...currentRequest,
    allocatedUnitIds: updatedAllocatedIds,
    updatedAt: occurredAt,
    history: [
      ...currentRequest.history,
      {
        id: `event-${requestId}-${currentRequest.history.length + 1}`,
        status: currentRequest.status,
        occurredAt,
        actor: "Mariam Blood Bank User",
        note: `Removed unit allocation (${unitId}) from this request.`,
      },
    ],
  };

  requests = requests.map((req, idx) =>
    idx === requestIndex ? updatedRequest : req,
  );

  return waitForMock({
    request: structuredClone(updatedRequest),
    units: structuredClone(updatedUnits),
  });
}

export async function updateDocumentReviewStatus(
  requestId: string,
  documentId: string,
  status: DocumentReviewStatus,
): Promise<BloodBankRequest> {
  const requestIndex = requests.findIndex((req) => req.id === requestId);
  if (requestIndex < 0) {
    throw new Error("Request not found in the demonstration queue.");
  }

  const currentRequest = requests[requestIndex];
  const updatedDocuments = currentRequest.documents.map((doc) =>
    doc.id === documentId ? { ...doc, reviewStatus: status } : doc,
  );

  const occurredAt = new Date().toISOString();
  const statusLabel =
    status === "accepted"
      ? "accepted"
      : status === "changes_requested"
        ? "requested changes on"
        : "reset to pending";

  const updatedRequest: BloodBankRequest = {
    ...currentRequest,
    documents: updatedDocuments,
    updatedAt: occurredAt,
    history: [
      ...currentRequest.history,
      {
        id: `event-${requestId}-${currentRequest.history.length + 1}`,
        status: currentRequest.status,
        occurredAt,
        actor: "Mariam Blood Bank User",
        note: `Document review: ${statusLabel} ${documentId}.`,
      },
    ],
  };

  requests = requests.map((req, idx) =>
    idx === requestIndex ? updatedRequest : req,
  );

  return waitForMock(structuredClone(updatedRequest));
}

export async function getBloodBankOperationalSnapshot(): Promise<BloodBankOperationalSnapshot> {
  const availableCount = getSharedBloodUnitsDirect().filter(
    (u) => u.status === "available",
  ).length;
  return waitForMock({
    availableBloodUnits: 280 + availableCount,
    recordedAt: "2026-09-08T08:00:00+03:00",
  });
}

export async function transitionBloodBankRequest(
  requestId: string,
  action: BloodBankRequestAction,
  options?: { note?: string; rejectReason?: string },
) {
  const requestIndex = requests.findIndex(
    (request) => request.id === requestId,
  );
  const transition = actionTransitions[action];

  if (requestIndex < 0) {
    throw new Error(
      "The request no longer exists in this demonstration queue.",
    );
  }

  const request = requests[requestIndex];
  if (!transition.from.includes(request.status)) {
    throw new Error(
      `This request cannot be moved from ${request.status} using that action. Refresh the queue and try again.`,
    );
  }

  const occurredAt = new Date().toISOString();
  const resolvedNote =
    action === "reject" && options?.rejectReason
      ? `Rejection reason: ${options.rejectReason}`
      : (options?.note ?? transition.note);

  // Automatically deallocate units back to available inventory on requisition rejection
  if (action === "reject" && request.allocatedUnitIds.length > 0) {
    for (const unitId of request.allocatedUnitIds) {
      deallocateUnitInSharedStore(requestId, unitId);
    }
  }

  const updatedRequest: BloodBankRequest = {
    ...request,
    status: transition.to,
    allocatedUnitIds:
      action === "reject" ? [] : request.allocatedUnitIds,
    updatedAt: occurredAt,
    history: [
      ...request.history,
      {
        id: `event-${request.id}-${request.history.length + 1}`,
        status: transition.to,
        occurredAt,
        actor: "Mariam Blood Bank User",
        note: resolvedNote,
      },
    ],
  };

  requests = requests.map((item, index) =>
    index === requestIndex ? updatedRequest : item,
  );

  return waitForMock(structuredClone(updatedRequest));
}

export async function getBloodBankAllDocuments(): Promise<BloodBankDocumentItem[]> {
  const items: BloodBankDocumentItem[] = [];

  for (const req of requests) {
    for (const doc of req.documents) {
      items.push({
        ...doc,
        requestId: req.id,
        hospital: req.hospital,
        bloodGroup: req.bloodGroup,
        component: req.component,
        urgency: req.urgency,
      });
    }
  }

  const sorted = items.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  return waitForMock(sorted);
}

export function resetBloodBankMockRequests() {
  requests = structuredClone(initialRequests);
  resetInventoryMock();
}
