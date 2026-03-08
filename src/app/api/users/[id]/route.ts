import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// PATCH update user (ADMIN ONLY)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: currentUser } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const validRoles = ["ADMIN", "OPERATOR", "VIEWER"];
  if (body.role && !validRoles.includes(body.role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
      { status: 400 }
    );
  }

  // Prevent admin from demoting themselves
  if (id === currentUser!.id && body.role && body.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  try {
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.password) data.password = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE user (ADMIN ONLY)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: currentUser } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === currentUser!.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}