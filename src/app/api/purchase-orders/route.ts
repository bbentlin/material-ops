import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createPurchaseOrderSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { supplier: {constains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true } },
        items: {
          include: {
            material: { select: { id: true, name: true, partNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth("OPERATOR");
  if (error) return error;

  const raw = await req.json();
  const parsed = createPurchaseOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { supplier, notes, expectedDate, items } = parsed.data;

  // Validate all materialIds exist
  const materialIds = items.map((i: { materialId: string }) => i.materialId);
  const materials = await prisma.material.findMany({
    where: { id: { in: materialIds } },
    select: { id: true },
  });
  const validIds = new Set(materials.map((m) => m.id));
  for (const item of items) {
    if (!validIds.has(item.materialId)) {
      return NextResponse.json(
        { error: `Material ${item.materialId} not found`},
        { status: 400 }
      );
    }
    if (!item.quantity || item.quantity < 1) {
      return NextResponse.json(
        { error: "Each item must have a quantity >= 1" },
        { status: 400 }
      );
    }
  }

  // Generate order number: PO-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const countToday = await prisma.purchaseOrder.count({
    where: {
      orderNumber: { startsWith: `PO-${dateStr}` },
    },
  });
  const orderNumber = `PO-${dateStr}-${String(countToday + 1).padStart(3, "0")}`;

  const order = await prisma.purchaseOrder.create({
    data: {
      orderNumber,
      supplier,
      notes: notes || null,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      totalItems: items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
      createdById: user!.id,
      items: {
        create: items.map((i: { materialId: string; quantity: number; unitPrice?: number | null }) => ({
          materialId: i.materialId,
          quantity: i.quantity,
          unitPrice: i.unitPrice ?? null,
        })),
      },
    },
    include: {
      items: {
        include: {
          material: { select: { name: true, partNumber: true } },
        },
      },
    },
  });

  logAudit({
    action: "CREATE_PO",
    entity: "PURCHASE_ORDER",
    entityId: order.id,
    details: JSON.stringify({
      orderNumber,
      supplier,
      itemCount: items.length,
      totalItems: order.totalItems,
    }),
    userId: user!.id,
  });

  return NextResponse.json(order, { status: 201 });
}