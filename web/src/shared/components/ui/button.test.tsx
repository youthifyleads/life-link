import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/shared/components/ui/button";

describe("Button", () => {
  it("supports keyboard and pointer activation", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Confirm request</Button>);
    await user.click(screen.getByRole("button", { name: "Confirm request" }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
