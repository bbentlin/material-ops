import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { selfProfileUpdateSchema } from "@/lib/validations";
import { compareSync, hash } from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const { error, user } = await requireAuth("VIEWER");
  if (error) return error;

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const { error, user } = await requireAuth("VIEWER");
  if (error) return error;

  const body = await req.json();
  const parsed = selfProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, currentPassword, newPassword } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { id: user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  const changes: string[] = [];

  if (name && name !== existing.name) {
    updateData.name = name;
    changes.push(`name: "${existing.name}" -> "${name}"`);
  }

  if (newPassword) {
    if (!currentPassword || !compareSync(currentPassword, existing.password)) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    updateData.password = await hash(newPassword, 10);
    changes.push("password changed");
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No effective changes to save" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (newPassword) {
    await prisma.passwordResetToken.updateMany({
      where: { userId: existing.id, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  await logAudit({
    action: "UPDATE_PROFILE",
    entity: "AUTH",
    entityId: existing.id,
    userId: existing.id,
    details: JSON.stringify({ changes }),
  });

  return NextResponse.json(updated);
}