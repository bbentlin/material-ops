import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { broadcastChange } from "@/lib/realtime";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  const { error, user } = await requireAuth("ADMIN");
  if (error) return error;
  
  const { id } = await params;

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, deletedAt: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!existing.deletedAt) {
    return NextResponse.json({ error: "User is not archived" }, { status: 400 });
  }

  const restored = await prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
      deleteById: null,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  await logAudit({
    action: "RESTORE_USER",
    entity: "USER", 
    entityId: id,
    userId: user!.id,
    details: JSON.stringify({ name: existing.name, email: existing.email }),
  });

  await broadcastChange("users");

  return NextResponse.json(restored);
}