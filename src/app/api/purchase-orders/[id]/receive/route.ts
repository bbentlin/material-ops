import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth("OPERATOR");
  if (error) return error;

  const { id } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          material: { select: { id: true, name: true, partNumber: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Only APPROVED orders can be received" },
      { status: 400 }
    );
  }

  // Create inbound movements and update stock for each item
  for (const item of order.items) {
    await prisma.movement.create({
      data: {
        type: "INBOUND",
        quantity: item.quantity,
        note: `Received from PO ${order.orderNumber}`,
        materialId: item.materialId,
        userId: user!.id,
      },
    });

    await prisma.material.update({
      where: { id: item.materialId },
      data: { quantity: { increment: item.quantity } },
    });

    await prisma.purchaseOrderItem.update({
      where: { id: item.id },
      data: { receivedQty: item.quantity},
    });
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: "RECEIVED",
      receivedAt: new Date(),
    },
    include: {
      items: {
        include: {
          material: { select: { id: true, name: true, partNumber: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true,  name: true } },
    },
  });

  return NextResponse.json(updated);
}