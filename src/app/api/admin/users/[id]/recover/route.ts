import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import {
  buildResetUrl,
  generateResetToken,
  getResetExpiryDate,
  hashResetToken,
} from "@/lib/password-reset";
import { success } from "zod";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: currentUser } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = getResetExpiryDate(15);

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: targetUser.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: targetUser.id,
      tokenHash,
      expiresAt,
    },
  });

  await logAudit({
    action: "ISSUE_PASSWORD_RESET",
    entity: "USER",
    entityId: targetUser.id,
    userId: currentUser!.id,
    details: JSON.stringify({
      targetEmail: targetUser.email,
      targetName: targetUser.name,
    }),
  });

  const baseUrl = 
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const resetLink = buildResetUrl(baseUrl, token);

  const allowDebugLink = 
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_ADMIN_RESET_LINKS === "1";

  if (!allowDebugLink) {
    return NextResponse.json({
      success: true,
      message: "A reset link has been issued for this user.",
    });
  }

  return NextResponse.json({
    success: true,
    message: "A reset link has been issued for this user.",
    resetLink,
    expiresAt: expiresAt.toISOString(),
  });
}