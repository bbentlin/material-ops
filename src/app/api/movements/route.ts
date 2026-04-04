import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createMovementSchema } from "@/lib/validations";

// GET movements with server-side pagination and search
export async function GET(req: NextRequest) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { material: { name: { contains: search, mode: "insensitive" } } },
      { material: { partNumber: { contains: search, mode: "insensitive" } } },
      { type: { contains: search, mode: "insensitive" } },
      { note: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      where.createdAt.gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  const [movements, total] = await Promise.all([
    prisma.movement.findMany({
      where,
      include: {
        material: { select: { name: true, partNumber: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movement.count({ where }),
  ]);

  return NextResponse.json({ movements, total, page, limit });
}

// POST create a movement (INBOUND or OUTBOUND)
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const raw = await req.json();
  const parsed = createMovementSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { type, quantity, note, materialId, destinationMaterialId } = parsed.data;

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

  // For transfer, validate destination and check sufficient stock
  if (type === "TRANSFER") {
    if (!destinationMaterialId) {
      return NextResponse.json(
        { error: "destinationMaterialId is required for transfers" },
        { status: 400 }
      );
    }
    if (destinationMaterialId === materialId) {
      return NextResponse.json(
        { error: "Source and destination must be different materials" },
        { status: 400 }
      );
    }
    const destination = await prisma.material.findUnique({
      where: { id: destinationMaterialId },
    });
    if (!destination) {
      return NextResponse.json(
        { error: "Destination material not found" },
        { status: 404 }
      );
    }
    if (material.quantity < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${material.quantity}` },
      );
    }
  }

  try {
    if (type === "TRANSFER") {
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
            material: { select: { name: true, partNumber: true } },
            user: { select: { name: true, email: true } },
          },
        }),
        // Decrement source
        prisma.material.update({
          where: { id: materialId },
          data: { quantity: { decrement: quantity } },
        }),
        // Increment destination
        prisma.material.update({
          where: { id: destinationMaterialId },
          data: { quantity: { increment: quantity } },
        }),
      ]);

      const destMaterial = await prisma.material.findUnique({
        where: { id: destinationMaterialId },
        select: { name: true },
      });

      await logAudit({
        action: "TRANSFER",
        entity: "MOVEMENT",
        entityId: movement.id,
        userId: user!.id,
        details: JSON.stringify({ from: material.name, to: destMaterial?.name, quantity }),
      });

      return NextResponse.json(movement, { status: 201 });
    }

    // INBOUND / OUTBOUND
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
          material: { select: { name: true, partNumber: true } },
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

    await logAudit({
      action: type,
      entity: "MOVEMENT",
      entityId: movement.id,
      userId: user!.id,
      details: JSON.stringify({ materialName: material.name, quantity }),
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create movement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}