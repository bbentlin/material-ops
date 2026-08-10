import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { hashResetToken } from "@/lib/password-reset";
import { success } from "zod";

export async function POST(req: NextRequest) {
  const disableRateLimits = process.env.E2E_DISABLE_RATE_LIMITS === "1";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = disableRateLimits
    ? { success: true, remaining: Number.MAX_SAFE_INTEGER, retryAfterMs: 0 }
    : rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This reset link is invalid or expired. Please request a new one." },
      { status: 400 }
    );
  }

  const newHash = await hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { password: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}