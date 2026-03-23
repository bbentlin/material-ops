import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const now = new Date();
  const trendDays = 14;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (trendDays - 1));
  startDate.setHours(0, 0, 0, 0);

  const movements = await prisma.movement.findMany({
    where: { createdAt: { gte: startDate } },
    select: { type: true, quantity: true, createdAt: true },
  });

  const trend = Array.from({ length: trendDays }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (trendDays - 1 - i));
    const dateStr = date.toISOString().slice(0, 10);
    const dayMovements = movements.filter(
      (m) => m.createdAt.toISOString().slice(0, 10) === dateStr
    );
    return {
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      inbound: dayMovements
        .filter((m) => m.type === "INBOUND")
        .reduce((s, m) => s + m.quantity, 0),
      outbound: dayMovements
        .filter((m) => m.type === "OUTBOUND")
        .reduce((s, m) => s + m.quantity, 0),
    };
  });

  return NextResponse.json(trend);
}