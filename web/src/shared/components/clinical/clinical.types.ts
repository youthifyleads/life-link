export const requestStatuses = [
  "draft",
  "submitted",
  "acknowledged",
  "needs_information",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "rejected",
  "cancelled",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export const urgencyLevels = ["routine", "urgent", "emergency"] as const;
export type UrgencyLevel = (typeof urgencyLevels)[number];

export const bloodGroups = [
  "A+",
  "A−",
  "B+",
  "B−",
  "AB+",
  "AB−",
  "O+",
  "O−",
] as const;
export type BloodGroup = (typeof bloodGroups)[number];
