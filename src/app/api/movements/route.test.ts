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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    movement: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { POST } from "./route";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/movements", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("api movements route POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "admin@materialops.com", role: "ADMIN" },
      error: null,
    } as never);
  });

  it("returns 400 for outbound when stock is insufficient", async () => {
    vi.mocked(prisma.material.findUnique).mockResolvedValue({
      id: "m1",
      name: "Steel",
      quantity: 2,
    } as never);

    const req = makeRequest({
      type: "OUTBOUND",
      quantity: 5,
      note: "",
      materialId: "m1",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Insufficient stock/i);
  });

  it("returns 400 for transfer when destination is missing", async () => {
    vi.mocked(prisma.material.findUnique).mockResolvedValue({
      id: "m1",
      name: "Steel",
      quantity: 10,
    } as never);

    const req = makeRequest({
      type: "TRANSFER",
      quantity: 2,
      note: "",
      materialId: "m1",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/destinationMaterialId/i);
  });

  it("returns 400 for transfer when source and destination are the same", async () => {
    vi.mocked(prisma.material.findUnique).mockResolvedValue({
      id: "m1",
      name: "Steel",
      quantity: 10,
    } as never);

    const req = makeRequest({
      type: "TRANSFER",
      quantity: 2,
      note: "", 
      materialId: "m1",
      destinationMaterialId: "m1",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("processes transfer and logs audit", async () => {
    vi.mocked(prisma.material.findUnique)
      .mockResolvedValueOnce({
        id: "m1",
        name: "Source Material",
        quantity: 10,
      } as never)
      .mockResolvedValueOnce({
        id: "m2",
        name: "Destination Material",
        quantity: 4,
      } as never)
      .mockResolvedValueOnce({
        name: "Destination Material",
      } as never);

    vi.mocked(prisma.movement.create).mockReturnValue({} as never);
    vi.mocked(prisma.material.update).mockReturnValue({} as never);

    vi.mocked(prisma.$transaction).mockResolvedValue([
      {
        id: "mv1",
        type: "TRANSFER",
      },
    ] as never);

    vi.mocked(logAudit).mockResolvedValue(undefined);

    const req = makeRequest({
      type: "TRANSFER",
      quantity: 3,
      note: "Move stock",
      materialId: "m1",
      destinationMaterialId: "m2",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TRANSFER",
        entity: "MOVEMENT",
        userId: "u1",
      })
    );
  });

  it("processes inbound and logs audit", async () => {
    vi.mocked(prisma.material.findUnique).mockResolvedValue({
      id: "m1",
      name: "Steel",
      quantity: 10,
    } as never);

    vi.mocked(prisma.movement.create).mockReturnValue({} as never);
    vi.mocked(prisma.material.update).mockReturnValue({} as never);

    vi.mocked(prisma.$transaction).mockResolvedValue([
      {
        id: "mv2",
        type: "INBOUND",
      },
    ] as never);

    vi.mocked(logAudit).mockResolvedValue(undefined);

    const req = makeRequest({
      type: "INBOUND",
      quantity: 5,
      note: "PO receive",
      materialId: "m1",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "INBOUND",
        entity: "MOVEMENT",
        userId: "u1",
      })
    );
  });

  it("returns auth error when unauthorized", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never);

    const req = makeRequest({
      type: "INBOUND",
      quantity: 1, 
      materialId: "m1",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});