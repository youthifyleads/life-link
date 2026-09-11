import type { UserRole } from "@/features/authentication/model/auth.types";
import { recordActivityEvent } from "@/features/notifications/mocks/activity.mock";
import { createNotification } from "@/features/notifications/mocks/notifications.mock";
import type {
  ActivityEvent,
  Notification,
  NotificationPriority,
  NotificationType,
  WorkflowEventPayload,
} from "@/features/notifications/types/notifications.types";

type EventBusListener = (payload: {
  event: WorkflowEventPayload;
  notification: Notification;
  activity: ActivityEvent;
}) => void;

const listeners = new Set<EventBusListener>();

export function subscribeToEventBus(listener: EventBusListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitWorkflowEvent(payload: WorkflowEventPayload): {
  notification: Notification;
  activity: ActivityEvent;
} {
  let title = "";
  let message = "";
  let type: NotificationType = "system_announcement";
  let priority: NotificationPriority = "normal";
  let recipientRoles: UserRole[] = ["admin"];
  let entityType = "General";
  let actionText = payload.message;
  let link = "/activity";

  switch (payload.eventType) {
    case "REQUEST_CREATED": {
      title = `New blood requisition: ${payload.entityId}`;
      message = `${payload.actor.name} (${payload.actor.organization}) submitted blood request ${payload.entityId}. Clinical review required.`;
      type = "request_update";
      priority = "urgent";
      recipientRoles = ["blood_bank_staff", "admin"];
      entityType = "Blood Request";
      actionText = `created requisition ${payload.entityId}`;
      link = `/blood-bank/requests/${payload.entityId}`;
      break;
    }
    case "UNITS_ALLOCATED": {
      title = `Units allocated for request ${payload.entityId}`;
      message = `${payload.actor.name} confirmed unit allocation for ${payload.entityId}. Prepared for crossmatch validation.`;
      type = "allocation_update";
      priority = "high";
      recipientRoles = ["hospital_staff", "admin"];
      entityType = "Blood Allocation";
      actionText = `allocated verified units to ${payload.entityId}`;
      link = `/hospital/requests/${payload.entityId}`;
      break;
    }
    case "UNIT_RELEASED": {
      title = `Blood unit dispatched: ${payload.entityId}`;
      message = `Unit ${payload.entityId} has departed Central Storage under active 2°C–6°C continuous temperature assurance.`;
      type = "tracking_update";
      priority = "urgent";
      recipientRoles = ["caregiver", "hospital_staff"];
      entityType = "Cold Chain Unit";
      actionText = `dispatched transit unit ${payload.entityId}`;
      link = `/caregiver/tracking/${payload.entityId}`;
      break;
    }
    case "DONATION_RESPONSE_RECEIVED": {
      title = `Donor confirmed appeal: ${payload.entityId}`;
      message = `${payload.actor.name} registered voluntary participation for shortage appeal ${payload.entityId}.`;
      type = "donation_update";
      priority = "normal";
      recipientRoles = ["blood_bank_staff"];
      entityType = "Donation Response";
      actionText = `accepted donation appeal ${payload.entityId}`;
      link = `/donor/requests/${payload.entityId}`;
      break;
    }
    case "INVENTORY_ALERT": {
      title = `Low reserve alert: ${payload.entityId}`;
      message = `Blood bank cold-chain reserve for group ${payload.entityId} reached critical minimum safety threshold.`;
      type = "inventory_alert";
      priority = "urgent";
      recipientRoles = ["blood_bank_staff", "admin"];
      entityType = "Inventory Reserve";
      actionText = `flagged low reserve alert for ${payload.entityId}`;
      link = "/blood-bank/inventory";
      break;
    }
    case "USER_PERMISSION_CHANGED": {
      title = `Governance security event: ${payload.entityId}`;
      message = `${payload.actor.name} modified permission policy matrix for capability ${payload.entityId}.`;
      type = "system_announcement";
      priority = "high";
      recipientRoles = ["admin"];
      entityType = "Security Policy";
      actionText = `updated capability permissions for ${payload.entityId}`;
      link = "/admin/roles";
      break;
    }
  }

  const notification = createNotification({
    title,
    message,
    type,
    priority,
    recipientRoles,
    relatedEntity: {
      type: "request",
      id: payload.entityId,
      label: payload.entityName ?? payload.entityId,
      link,
    },
    sourceModule:
      payload.actor.role === "hospital_staff"
        ? "hospital"
        : payload.actor.role === "blood_bank_staff"
          ? "blood_bank"
          : payload.actor.role === "donor"
            ? "donor"
            : payload.actor.role === "caregiver"
              ? "caregiver"
              : "admin",
  });

  const activity = recordActivityEvent({
    actor: payload.actor,
    action: actionText,
    entityType,
    entityId: payload.entityId,
    entityName: payload.entityName,
    organization: payload.actor.organization,
    result: "success",
    details: payload.message,
    link,
    metadata: payload.metadata,
  });

  listeners.forEach((listener) => {
    try {
      listener({ event: payload, notification, activity });
    } catch (e) {
      console.error("Error in event bus subscriber:", e);
    }
  });

  return { notification, activity };
}

// Convenient simulation triggers for testing and demo walkthrough
export function simulateHospitalRequestCreated(
  requestId = "BR-2026-9901",
  hospitalName = "Cairo General Hospital",
) {
  return emitWorkflowEvent({
    eventType: "REQUEST_CREATED",
    actor: {
      id: "USR-002",
      name: "Dr. Sarah Mitchell",
      role: "hospital_staff",
      organization: hospitalName,
    },
    entityId: requestId,
    entityName: `Emergency Requisition ${requestId}`,
    message: `Hospital staff submitted urgent requisition for 2 units O- Red Cells at ${hospitalName}.`,
    metadata: { urgency: "emergency", units: 2 },
  });
}

export function simulateUnitsAllocated(
  requestId = "BR-2026-2194",
  unitCode = "UNT-O-NEG-0992",
) {
  return emitWorkflowEvent({
    eventType: "UNITS_ALLOCATED",
    actor: {
      id: "USR-003",
      name: "Dr. Laila Al-Sayed",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    entityId: requestId,
    entityName: `Unit Allocation for ${requestId}`,
    message: `Technologist allocated verified unit ${unitCode} to clinical request ${requestId}.`,
    metadata: { unitCode },
  });
}

export function simulateUnitReleased(
  unitCode = "UNT-B-POS-0331",
  courierName = "MedTrans Courier #4",
) {
  return emitWorkflowEvent({
    eventType: "UNIT_RELEASED",
    actor: {
      id: "USR-003",
      name: "Dr. Laila Al-Sayed",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    entityId: unitCode,
    entityName: `Transit Unit ${unitCode}`,
    message: `Unit handed over to ${courierName}. Continuous 2°C–6°C cold-chain tracking initiated.`,
    metadata: { courier: courierName },
  });
}

export function simulateDonorResponseReceived(
  donorName = "Omar Donor",
  appealId = "DR-2026-0811",
) {
  return emitWorkflowEvent({
    eventType: "DONATION_RESPONSE_RECEIVED",
    actor: {
      id: "USR-006",
      name: donorName,
      role: "donor",
      organization: "Egyptian National Blood Bank System",
    },
    entityId: appealId,
    entityName: `Appeal Response ${appealId}`,
    message: `${donorName} accepted shortage appeal ${appealId} and scheduled appointment.`,
  });
}

export function simulateInventoryAlert(bloodGroup = "O-") {
  return emitWorkflowEvent({
    eventType: "INVENTORY_ALERT",
    actor: {
      id: "USR-SYS",
      name: "Cold-Chain Sensor System",
      role: "blood_bank_staff",
      organization: "National Blood Transfusion Services",
    },
    entityId: bloodGroup,
    entityName: `${bloodGroup} Reserve Alert`,
    message: `Reserve count for ${bloodGroup} has breached the minimum threshold of 4 units.`,
  });
}
