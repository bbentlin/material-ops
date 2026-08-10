import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { buildResetUrl, generateResetToken, getResetExpiryDate, hashResetToken } from "@/lib/password-reset";
import { success } from "zod";
import { error } from "console";

export async function POST(req: NextRequest) {
  const disableRateLimits = process.env.E2E_DISABLE_RATE_LIMITS === "1";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = disableRateLimits
    ? { success: true, remaining: Number.MAX_SAFE_INTEGER, retryAfterMs: 0 }
    : rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const email = parsed.data.email;

  const generic = {
    success: true,
    message: "If an account exists for that email, a reset link has been generated.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(generic);
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = getResetExpiryDate(15);

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  await logAudit({
    action: "REQUEST_PASSWORD_RESET",
    entity: "AUTH",
    userId: user.id,
    details: JSON.stringify({ email: user.email }),
  });

  const appOrigin = 
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(req.url).origin;

  const resetLink = buildResetUrl(appOrigin, token);

  const isDevLike = process.env.NODE_ENV !== "production";
  if (isDevLike) {
    return NextResponse.json({ ...generic, resetLink });
  }

  console.info("Password reset link generated for user:", user.email);
  return NextResponse.json(generic);
}