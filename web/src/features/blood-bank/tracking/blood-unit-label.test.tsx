import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import "@/app/i18n/i18n";
import { setAppLanguage } from "@/app/i18n/i18n";
import { BloodUnitLabel } from "@/features/blood-bank/tracking/blood-unit-label";
import { TrackingResult } from "@/features/blood-bank/tracking/tracking-result";
import type { BloodUnit } from "@/features/blood-bank/types/blood-bank.types";
import { MedicalBarcode } from "@/shared/components/barcode/medical-barcode";
import { MedicalQrCode } from "@/shared/components/barcode/medical-qr-code";

const mockUnit: BloodUnit = {
  id: "UNT-B-POS-0331",
  bloodGroup: "B+",
  component: "fresh_frozen_plasma",
  status: "allocated",
  storageLocation: "Sub-Zero Freezer 2 – Rack A",
  collectionDate: "2026-08-15",
  expiryDate: "2027-08-15T23:59:59.000Z",
  allocatedRequestId: "BR-2026-2192",
  registeredAt: "2026-08-15T10:30:00.000Z",
  updatedAt: "2026-09-08T07:30:00.000Z",
  custodyEvents: [],
};

describe("ISBT 128 Medical Barcode & Blood Unit Label System", () => {
  beforeEach(async () => {
    await setAppLanguage("en");
  });

  describe("MedicalBarcode", () => {
    it("renders SVG element with accessible label for unit ID", () => {
      render(<MedicalBarcode value="UNT-B-POS-0331" />);
      const svgEl = screen.getByRole("img", { name: /Barcode: UNT-B-POS-0331/i });
      expect(svgEl).toBeInTheDocument();
      expect(svgEl.tagName.toLowerCase()).toBe("svg");
    });
  });

  describe("MedicalQrCode", () => {
    it("renders QR code container and generates SVG markup asynchronously", async () => {
      render(
        <MedicalQrCode
          value="https://lifelink.health/blood-bank/tracking?id=UNT-B-POS-0331"
          ariaLabel="Test QR Code"
        />
      );

      await waitFor(() => {
        const qrContainer = screen.getByRole("img", { name: "Test QR Code" });
        expect(qrContainer).toBeInTheDocument();
        expect(qrContainer.querySelector("svg")).not.toBeNull();
      });
    });
  });

  describe("BloodUnitLabel", () => {
    it("renders complete 4-quadrant ISBT 128 clinical label with DIN, blood group, component, and barcodes", async () => {
      render(<BloodUnitLabel unit={mockUnit} />);

      // Top-Left: DIN & barcode
      expect(screen.getAllByText("UNT-B-POS-0331").length).toBeGreaterThanOrEqual(1);

      // Top-Right: Blood group & Rh phenotype
      expect(screen.getByText("B+")).toBeInTheDocument();
      expect(screen.getByText(/Rh\(D\) POSITIVE/i)).toBeInTheDocument();

      // Bottom-Left: Biological component & temperature
      expect(screen.getByText(/Fresh Frozen Plasma/i)).toBeInTheDocument();
      expect(screen.getByText(/≤ -18°C/i)).toBeInTheDocument();

      // Bottom-Right: Expiry date & Requisition allocation
      expect(screen.getByText("2027-08-15")).toBeInTheDocument();
      expect(screen.getByText(/#BR-2026-2192/i)).toBeInTheDocument();

      // QR Code container exists
      await waitFor(() => {
        expect(
          screen.getByRole("img", { name: /Verification QR code for unit UNT-B-POS-0331/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("BloodUnitPrintModal & TrackingResult", () => {
    it("opens print modal preview when user clicks Print Label button", async () => {
      render(
        <MemoryRouter>
          <TrackingResult unit={mockUnit} />
        </MemoryRouter>
      );

      const printButton = screen.getByRole("button", { name: /Print Label/i });
      expect(printButton).toBeInTheDocument();

      fireEvent.click(printButton);

      // Verify modal appears
      expect(
        await screen.findByText(/Blood Unit Label Preview \(ISBT 128\)/i)
      ).toBeInTheDocument();

      // Verify format selection buttons are present
      expect(screen.getByText(/Thermal \(100×100mm\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard A4/i)).toBeInTheDocument();

      // Verify Print Now button
      expect(screen.getByText(/Print Label Now/i)).toBeInTheDocument();
    });
  });
});
