import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppError from "@/app/error";
import GlobalError from "@/app/global-error";
import DashboardError from "@/app/dashboard/error";
import AdminError from "@/app/admin/error";

function props() {
  return {
    error: new Error("boom"),
    reset: vi.fn(),
  };
}

describe("AppError", () => {
  it("renders fallback", () => {
    render(<AppError {...props()} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls reset on retry", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<AppError {...p} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(p.reset).toHaveBeenCalledTimes(1);
  });
});

describe("GlobalError", () => {
  it("renders fallback", () => {
    render(<GlobalError {...props()} />);
    expect(screen.getByText("A critical error has occurred")).toBeInTheDocument();
  });

  it("calls reset on retry", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<GlobalError {...p} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(p.reset).toHaveBeenCalledTimes(1);
  });
});

describe("DashboardError", () => {
  it("renders fallback", () => {
    render(<DashboardError {...props()} />);
    expect(screen.getByText("Dashboard error")).toBeInTheDocument();
  });

  it("calls reset on retry", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<DashboardError {...p} />);
    await user.click(screen.getByRole("button", { name: "Retry section" }));
    expect(p.reset).toHaveBeenCalledTimes(1);
  });
});

describe("AdminError", () => {
  it("renders fallback", () => {
    render(<AdminError {...props()} />);
    expect(screen.getByText("Admin error")).toBeInTheDocument();
  });

  it("calls reset on retry", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<AdminError {...p} />);
    await user.click(screen.getByRole("button", { name: "Retry section" }));
    expect(p.reset).toHaveBeenCalledTimes(1);
  });
});