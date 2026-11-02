import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";

const createWarehouseSchema = z.object({
  name: z.string().trim().min(1, "Warehouse name is required").max(200),
  address: z.string().trim().max(500).nullable().optional(),
});

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(warehouses);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body"}, { status: 400 });
  }

  const parsed = createWarehouseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address || null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error: unknown) {
    if (hasPrismaErrorCode(error, "P2002")) {
      return NextResponse.json(
        { error: "A warehouse with this name already exists" },
        { status: 409 },
      ),
    }

    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 },
    );
  }
}