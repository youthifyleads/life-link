import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "@/app/i18n/i18n";
import { setAppLanguage } from "@/app/i18n/i18n";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";

describe("clinical primitives", () => {
  it("renders request status with a readable label", async () => {
    await act(async () => {
      await setAppLanguage("en");
    });
    render(<RequestStatusBadge status="needs_information" />);
    expect(screen.getByText("Needs information")).toBeVisible();
  });

  it("labels emergency urgency without relying on color", async () => {
    await act(async () => {
      await setAppLanguage("en");
    });
    render(<UrgencyBadge urgency="emergency" />);
    expect(screen.getByText("Emergency")).toBeVisible();
  });

  it("exposes the blood group to assistive technology", () => {
    render(<BloodGroupBadge group="O−" />);
    expect(screen.getByLabelText("Blood group O−")).toBeVisible();
  });

  it("renders Arabic translations when language is switched to ar", async () => {
    await act(async () => {
      await setAppLanguage("ar");
    });
    const { unmount } = render(<RequestStatusBadge status="submitted" />);
    expect(screen.getByText("تم التقديم")).toBeVisible();
    unmount();

    render(<UrgencyBadge urgency="urgent" />);
    expect(screen.getByText("عاجل")).toBeVisible();

    // Reset back to English
    await act(async () => {
      await setAppLanguage("en");
    });
  });
});
