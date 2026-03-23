import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

// GET single material
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, color: true } },
      movements: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  return NextResponse.json(material);
}

// PATCH update material
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.material.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  try {
    const material = await prisma.material.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        partNumber: body.partNumber ?? existing.partNumber,
        description: body.description ?? existing.description,
        quantity: body.quantity !== undefined ? body.quantity : existing.quantity,
        minQuantity: body.minQuantity !== undefined ? body.minQuantity : existing.minQuantity,
        departmentId: body.departmentId !== undefined ? (body.departmentId || null) : existing.departmentId,
        unit: body.unit ?? existing.unit,
        location: body.location ?? existing.location,
      },
    });

    // Build a list of what changed for the audit log
    const changes: string[] = [];
    if (body.name && body.name !== existing.name) changes.push(`name: "${existing.name}" → "${body.name}"`);
    if (body.partNumber && body.partNumber !== existing.partNumber) changes.push(`partNumber: "${existing.partNumber}" → "${body.partNumber}"`);
    if (body.quantity !== undefined && body.quantity !== existing.quantity) changes.push(`quantity: ${existing.quantity} → ${body.quantity}`);
    if (body.minQuantity !== undefined && body.minQuantity !== existing.minQuantity) changes.push(`minQuantity: ${existing.minQuantity} → ${body.minQuantity}`);
    if (body.unit && body.unit !== existing.unit) changes.push(`unit: "${existing.unit}" → "${body.unit}"`);
    if (body.location !== undefined && body.location !== existing.location) changes.push(`location`);
    if (body.departmentId !== undefined && body.departmentId !== existing.departmentId) changes.push(`department`);

    await logAudit({
      action: "UPDATE_MATERIAL",
      entity: "MATERIAL",
      entityId: id,
      userId: user!.id,
      details: JSON.stringify({ name: material.name, changes }),
    });

    return NextResponse.json(material);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE material
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.material.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  try {
    // Delete related movements first
    await prisma.movement.deleteMany({ where: { materialId: id } });
    await prisma.material.delete({ where: { id } });

    await logAudit({
      action: "DELETE_MATERIAL",
      entity: "MATERIAL",
      entityId: id,
      userId: user!.id,
      details: JSON.stringify({ name: existing.name, partNumber: existing.partNumber }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}