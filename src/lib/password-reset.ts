import { createHash, randomBytes } from "node:crypto";

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getResetExpiryDate(minutes = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function buildResetUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}