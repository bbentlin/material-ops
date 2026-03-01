import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
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
      movements: {
        orderBy: { createdAt: "desc" },
        take: 20,
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
  const { error } = await requireAuth("OPERATOR");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.material.findUnique({ where: { id }});
  if (!existing) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  try {
    const material = await prisma.material.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        sku: body.sku ?? existing.sku,
        description: body.description ?? existing.description,
        unit: body.unit ?? existing.unit,
        location: body.location ?? existing.location,
      },
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
  const { error } = await requireAuth("ADMIN");
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

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = 
      err instanceof Error ? err.message : "Failed to delete material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}