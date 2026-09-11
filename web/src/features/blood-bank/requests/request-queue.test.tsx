import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import "@/app/i18n/i18n";
import { setAppLanguage } from "@/app/i18n/i18n";
import { RequestQueuePage } from "@/features/blood-bank/requests/request-queue-page";
import { resetBloodBankMockRequests } from "@/features/blood-bank/requests/blood-bank-requests.mock";

function renderQueuePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RequestQueuePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("RequestQueuePage (Clinical Dispatch Ledger)", () => {
  beforeEach(async () => {
    resetBloodBankMockRequests();
    await act(async () => {
      await setAppLanguage("en");
    });
  });

  it("renders dispatch cadence telemetry cards with active, emergency, and urgent counts", async () => {
    renderQueuePage();

    await waitFor(() => {
      expect(screen.getByText("Active in Queue")).toBeInTheDocument();
    });

    expect(screen.getAllByText("STAT Emergency").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Urgent Triage").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Needs Allocation").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Preparing & Ready")).toBeInTheDocument();
  });

  it("renders unified ledger table with requisition IDs, hospital facility, and blood specs", async () => {
    renderQueuePage();

    await waitFor(() => {
      expect(screen.getAllByText("BR-2026-2194").length).toBeGreaterThan(0);
    });

    // Check hospital name
    expect(screen.getAllByText("Cairo General Hospital").length).toBeGreaterThan(0);
    // Check blood group badge is present
    expect(screen.getAllByLabelText("Blood group O−").length).toBeGreaterThan(0);
    // Check component label
    expect(screen.getAllByText("Red blood cells").length).toBeGreaterThan(0);
  });

  it("filters requisitions when clicking the STAT Emergency quick triage card", async () => {
    renderQueuePage();

    await waitFor(() => {
      expect(screen.getAllByText("BR-2026-2194").length).toBeGreaterThan(0);
    });

    // Click the STAT Emergency tile
    const emergencyButtons = screen.getAllByRole("button", { name: /STAT Emergency/i });
    fireEvent.click(emergencyButtons[0]);

    // Emergency requisitions should be present
    expect(screen.getAllByText("BR-2026-2194").length).toBeGreaterThan(0);

    // Routine requisition (BR-2026-2190) should be filtered out
    expect(screen.queryByText("BR-2026-2190")).not.toBeInTheDocument();
  });

  it("filters requisitions via search input by ID or hospital name", async () => {
    renderQueuePage();

    await waitFor(() => {
      expect(screen.getAllByText("BR-2026-2194").length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/Search ID, hospital, or component/i);
    fireEvent.change(searchInput, { target: { value: "Cairo General" } });

    expect(screen.getAllByText("Cairo General Hospital").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nile Specialist Hospital")).not.toBeInTheDocument();
  });

  it("allows acknowledging a submitted request and reflects success feedback", async () => {
    renderQueuePage();

    await waitFor(() => {
      expect(screen.getAllByText("BR-2026-2194").length).toBeGreaterThan(0);
    });

    // Find the Acknowledge request button
    const ackButtons = screen.getAllByRole("button", { name: /Acknowledge request/i });
    expect(ackButtons.length).toBeGreaterThan(0);

    fireEvent.click(ackButtons[0]);

    // Should display success message
    await waitFor(
      () => {
        expect(screen.getByRole("status")).toHaveTextContent(/Request BR-2026-2194 is now acknowledged/i);
      },
      { timeout: 8000 },
    );
  }, 15000);
});
