import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

// GET all materials
export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(materials);
}

// POST create a new material
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const { name, sku, description, quantity, unit, location } = await req.json();

  if (!name || !sku) {
    return NextResponse.json(
      { error: "Name and SKU are required" },
      { status: 400 }
    );
  }

  try {
    const material = await prisma.material.create({
      data: {
        name,
        sku,
        description: description ?? "",
        quantity: quantity ?? 0,
        unit: unit ?? "pieces",
        location: location ?? "",
      },
    });

    // Log the creation as an inbound movement
    await prisma.movement.create({
      data: {
        type: "INBOUND",
        quantity: quantity ?? 0,
        note: `Initial creation by ${user!.email}`,
        materialId: material.id,
        userId: user!.id,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}