import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, type NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  authenticate: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

import { POST, DELETE } from "./route";
import { authenticate, getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

function makeJsonRequest(url: string, method: string, body: unknown, headers?: Record<string, string>) {
  return new Request(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("api auth route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when rate limit fails", async () => {
    vi.mocked(rateLimit).mockReturnValue({
      success: false,
      remaining: 0,
      retryAfterMs: 30000,
    });

    const req = makeJsonRequest(
      "http://localhost/api/auth",
      "POST",
      { email: "admin@materialops.com", password: "x" },
      { "x-forwarded-for": "10.0.0.1" }
    );

    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/Too many login attempts/i);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns 400 on invalid payload", async () => {
    vi.mocked(rateLimit).mockReturnValue({
      success: true,
      remaining: 4,
      retryAfterMs: 0,
    });

    const req = makeJsonRequest("http://localhost/api/auth", "POST", {
      email: "not-an-email",
      password: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("logs in successfully and sets token cookie", async () => {
    vi.mocked(rateLimit).mockReturnValue({
      success: true,
      remaining: 4,
      retryAfterMs: 0,
    });

    vi.mocked(authenticate).mockResolvedValue({
      user: {
        id: "u1",
        email: "admin@materialops.com",
        name: "Admin",
        role: "ADMIN",
      },
      token: "jwt-token-value",
    } as never);

    vi.mocked(logAudit).mockResolvedValue(undefined);

    const req = makeJsonRequest("http://localhost/api/auth", "POST", {
      email: "admin@materialops.com",
      password: "Admin!Change#Me2026",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user.email).toBe("admin@materialops.com");

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("token=");
    expect(setCookie).toContain("HttpOnly");

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LOGIN",
        entity: "AUTH",
        userId: "u1",
      })
    );
  });

  it("logout clears token cookie and writes audit when user exists", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      email: "admin@materialops.com",
      name: "Admin",
      role: "ADMIN",    
    } as never);

    vi.mocked(logAudit).mockResolvedValue(undefined);

    const res = await DELETE();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("token=");
    expect(setCookie).toContain("Max-Age=0");

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LOGOUT",
        entity: "AUTH",
        userId: "u1",
      })
    );
  });

  it("logout still succeeds without current user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as never);

    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(logAudit).not.toHaveBeenCalled();
  });
});