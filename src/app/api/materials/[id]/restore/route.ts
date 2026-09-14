import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { broadcastChange } from "@/lib/realtime";

export async function POST(
  _req:NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.material.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      partNumber: true,
      deletedAt: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  if (!existing.deletedAt) {
    return NextResponse.json({ error: "Material not archived" }, { status: 400 });
  }

  const restored = await prisma.material.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedById: null,
    },
  });

  await logAudit({
    action: "RESTORE_MATERIAL",
    entity: "MATERIAL",
    entityId: id,
    userId: user!.id,
    details: JSON.stringify({ name: existing.name, partNumber: existing.partNumber }),
  });

  await broadcastChange("materials");

  return NextResponse.json(restored);
}