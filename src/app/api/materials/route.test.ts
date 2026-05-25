import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, type NextRequest } from "next/server";

vi.mock("@/lib/permissions", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    material: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    movement: {
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "./route";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

function makeRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe("api materials route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns auth error when unauthorized", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never);

    const req = makeRequest("http://localhost/api/materials", "GET");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET returns paginated materials and total", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
      error: null,
    } as never);

    vi.mocked(prisma.material.findMany).mockResolvedValue([
      {
        id: "m1",
        name: "Steel",
        partNumber: "MAT-001",
        quantity: 10,
        minQuantity: 5,
      },
    ] as never);

    vi.mocked(prisma.material.count).mockResolvedValue(1 as never);

    const req = makeRequest(
      "http://localhost/api/materials?page=2&limit=10&search=steel&sortKey=name&sortDir=asc&departmentId=d1&dateFrom=2026-01-01&dateTo=2026-01-31",
      "GET"
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.page).toBe(2);
    expect(body.limit).toBe(10);
    expect(body.total).toBe(1);
    expect(Array.isArray(body.materials)).toBe(true);

    expect(prisma.material.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: expect.objectContaining({
          departmentId: "d1",
        }),
      })
    );
  });

  it("POST returns 400 on invalid payload", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "admin@materialops.com", role: "ADMIN" },
      error: null,
    } as never);

    const req = makeRequest("http://localhost/api/materials", "POST", {
      name: "",
      partNumber: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST creates material, creates initial inbound movement, and logs audit", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "admin@materialops.com", role: "ADMIN" },
      error: null,
    } as never);

    vi.mocked(prisma.material.create).mockResolvedValue({
      id: "m1",
      name: "E2E Steel",
      partNumber: "E2E-001",
    } as never);

    vi.mocked(prisma.movement.create).mockResolvedValue({
      id: "mv1",
      type: "INBOUND",
    } as never);

    vi.mocked(logAudit).mockResolvedValue(undefined);

    const req = makeRequest("http://localhost/api/materials", "POST", {
      name: "E2E Steel",
      partNumber: "E2E-001",
      quantity: 12,
      minQuantity: 4,
      unit: "pieces",
      location: "Shelf A",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    expect(prisma.material.create).toHaveBeenCalled();
    expect(prisma.movement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "INBOUND",
          materialId: "m1",
          userId: "u1",
        }),
      })
    );

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE_MATERIAL",
        entity: "MATERIAL",
        entityId: "m1",
        userId: "u1",
      })
    );
  });
});