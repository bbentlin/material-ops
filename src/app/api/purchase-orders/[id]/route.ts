import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const { id } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true } },
      items: {
        include: {
          material: {
            select: { id: true, name: true, partNumber: true, unit: true, quantity: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth("OPERATOR");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { status, supplier, notes, expectedDate, items } = body;

  const existing = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Status transition validation
  if (status) {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["APPROVED", "CANCELLED"],
      APPROVED: ["RECEIVED", "CANCELLED"],
      RECEIVED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existing.status} to ${status}`},
        { status: 400 }
      );
    }
  }

  // Only DRAFT orders can have their details edited
  if ((supplier || notes !== undefined || expectedDate !== undefined || items) && existing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only DRAFT orders can be edited" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData : any = {};
  if (status) updateData.status = status;
  if (supplier) updateData.supplier = supplier;
  if (notes !== undefined) updateData.notes = notes || null;
  if (expectedDate !== undefined) updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;

  if (status === "APPROVED") {
    updateData.approvedById = user!.id;
  }

  // If items provided and order is DRAFT, replace all items
  if (items && Array.isArray(items) && existing.status === "DRAFT") {
    // Validate materials
    const materialIds = items.map((i: { materialId: string }) => i.materialId);
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { id: true },
    });
    const validIds = new Set(materials.map((m) => m.id));
    for (const item of items) {
      if (!validIds.has(item.materialId)) {
        return NextResponse.json({ error: `Material ${item.materialId} not found` }, { status: 400 });
      }
    }

    // Delete old items and create new ones
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await prisma.purchaseOrderItem.createMany({
      data: items.map((i: { materialId: string; quantity: number; unitPrice?: number }) => ({
        purchaseOrderId: id,
        materialId: i.materialId,
        quantity: i.quantity,
        unitPrice: i.unitPrice ?? null,
      })),
    });
    updateData.totalItems = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
  }

  const updated = await  prisma.purchaseOrder.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
      items: {
        include: {
          material: { select: { id: true, name: true, partNumber: true, unit: true } },
        },
      },
    },
  });

  logAudit({
    action: status ? `PO_${status}` : "UPDATE_PO",
    entity: "PURCHASE_ORDER",
    entityId: id,
    details: JSON.stringify({
      orderNumber: updated.orderNumber,
      ...(status ? { from: existing.status, to: status } : {}),
      ...(supplier ? { supplier } : {}),
    }),
    userId: user!.id,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.status === "RECEIVED") {
    return NextResponse.json(
      { error: "Cannot delete a received order"},
      { status: 400 }
    );
  }

  await prisma.purchaseOrder.delete({ where: { id } });

  logAudit({
    action: "DELETE_PO",
    entity: "PURCHSE_ORDER",
    entityId: id,
    details: JSON.stringify({ orderNumber: existing.orderNumber, supplier: existing.supplier }),
    userId: user!.id,
  });

  return NextResponse.json({ success: true });
}