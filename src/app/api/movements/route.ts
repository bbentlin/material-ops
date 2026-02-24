import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

// GET all movements
export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const movements = await prisma.movement.findMany({
    include: {
      material: { select: { name: true, sku: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(movements);
}

// POST create a movement (INBOUND or OUTBOUND)
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const { type, quantity, note, materialId } = await req.json();

  if (!type || !quantity || !materialId) {
    return NextResponse.json(
      { error: "type, quantity, and materialId are required" },
      { status: 400 }
    );
  }

  if (!["INBOUND", "OUTBOUND", "TRANSFER"].includes(type)) {
    return NextResponse.json(
      { error: "type must be INBOUND, OUTBOUND, or TRANSFER" },
      { status: 400 }
    );
  }

  // Verify material exists
  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    return NextResponse.json(
      { error: "Material not found" },
      { status: 404 }
    );
  }

  // For outbound, check sufficient stock
  if (type === "OUTBOUND" && material.quantity < quantity) {
    return NextResponse.json(
      { error: `Insufficient stock. Available: ${material.quantity}` },
      { status: 400 }
    );
  }

  try {
    // Create the movement and update material quantity in a transaction
    const [movement] = await prisma.$transaction([
      prisma.movement.create({
        data: {
          type,
          quantity,
          note: note ?? "",
          materialId,
          userId: user!.id,
        },
        include: {
          material: { select: { name: true, sku: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.material.update({
        where: { id: materialId },
        data: {
          quantity: {
            increment: type === "INBOUND" ? quantity : -quantity,
          },
        },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create movement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}