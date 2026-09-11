import { describe, expect, it } from "vitest";
import {
  getBloodUnitStatusPresentation,
  getRequestStatusPresentation,
  getTrackingStatusPresentation,
  normalizeBackendRequestStatus,
  serializeFrontendRequestStatus,
} from "./status-adapter";

describe("status-adapter", () => {
  describe("normalizeBackendRequestStatus", () => {
    it("normalizes backend 'requested' to frontend 'submitted'", () => {
      expect(normalizeBackendRequestStatus("requested")).toBe("submitted");
      expect(normalizeBackendRequestStatus("REQUESTED")).toBe("submitted");
    });

    it("normalizes backend 'prepared' to frontend 'preparing'", () => {
      expect(normalizeBackendRequestStatus("prepared")).toBe("preparing");
    });

    it("normalizes standard lifecycle statuses accurately", () => {
      expect(normalizeBackendRequestStatus("acknowledged")).toBe("acknowledged");
      expect(normalizeBackendRequestStatus("confirmed")).toBe("confirmed");
      expect(normalizeBackendRequestStatus("completed")).toBe("completed");
      expect(normalizeBackendRequestStatus("cancelled")).toBe("cancelled");
    });
  });

  describe("serializeFrontendRequestStatus", () => {
    it("serializes frontend 'submitted' to backend 'requested'", () => {
      expect(serializeFrontendRequestStatus("submitted")).toBe("requested");
    });

    it("serializes frontend 'preparing' and 'ready' to backend 'prepared'", () => {
      expect(serializeFrontendRequestStatus("preparing")).toBe("prepared");
      expect(serializeFrontendRequestStatus("ready")).toBe("prepared");
    });

    it("serializes frontend terminal states", () => {
      expect(serializeFrontendRequestStatus("completed")).toBe("completed");
      expect(serializeFrontendRequestStatus("cancelled")).toBe("cancelled");
      expect(serializeFrontendRequestStatus("rejected")).toBe("cancelled");
    });
  });

  describe("getRequestStatusPresentation", () => {
    it("provides clinical labels and variants", () => {
      const submitted = getRequestStatusPresentation("submitted");
      expect(submitted.label).toBe("Submitted");
      expect(submitted.variant).toBe("secondary");

      const ready = getRequestStatusPresentation("ready");
      expect(ready.label).toBe("Preparation Completed");
      expect(ready.variant).toBe("success");

      const rejected = getRequestStatusPresentation("rejected");
      expect(rejected.label).toBe("Rejected");
      expect(rejected.variant).toBe("destructive");
    });
  });

  describe("biological and tracking statuses", () => {
    it("provides valid presentations for blood units and transit", () => {
      expect(getBloodUnitStatusPresentation("available").label).toBe("Available");
      expect(getBloodUnitStatusPresentation("quarantined").variant).toBe("destructive");

      expect(getTrackingStatusPresentation("in_transit").label).toBe("In Transit");
      expect(getTrackingStatusPresentation("ready_for_transfusion").variant).toBe("success");
    });
  });
});
