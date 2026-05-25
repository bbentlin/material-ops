import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, type NextRequest } from "next/server";

vi.mock("@/lib/permissions", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { GET } from "./route";
import { requireAuth } from "@/lib/permissions";
import { prisma } from "@/lib/db";

function makeRequest(url: string) {
  return new Request(url, { method: "GET" }) as unknown as NextRequest;
}

describe("api audit-logs route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns auth error when unauthorized", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never);

    const res = await GET(makeRequest("http://localhost/api/audit-logs"));
    expect(res.status).toBe(401);
  });

  it("returns filtered and paginated logs", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
      error: null,
    } as never);

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
      {
        id: "a1",
        action: "CREATE_MATERIAL",
        entity: "MATERIAL",
        details: "{\"name\":\"Steel\"}",
        createdAt: new Date().toISOString(),
        user: { name: "Admin", email: "admin@materialops.com" },
      },
    ] as never);

    vi.mocked(prisma.auditLog.count).mockResolvedValue(1 as never);

    const res = await GET(
      makeRequest("http://localhost/api/audit-logs?page=2&limit=25&entity=MATERIAL&search=steel")
    );

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.page).toBe(2);
    expect(body.limit).toBe(25);
    expect(body.total).toBe(1);
    expect(Array.isArray(body.logs)).toBe(true);

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 25,
        take: 25,
        where: expect.objectContaining({
          entity: "MATERIAL",
          OR: expect.any(Array),
        }),
      })
    );
  });

  it("supports entity and action filters", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
      error: null,
    } as never);

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0 as never);

    const res = await GET(
      makeRequest("http://localhost/api/audit-logs?page=1&limit=10&entity=USER&action=DELETE_USER")
    );

    expect(res.status).toBe(200);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entity: "USER",
          action: "DELETE_USER",
        }),
      })
    );
  });
});