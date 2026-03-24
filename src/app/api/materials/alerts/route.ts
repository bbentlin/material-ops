import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const materials = await prisma.material.findMany({
    include: {
      department: { select: { id: true, name: true, color: true } },
    },
  });

  const alerts = materials  
    .filter((m) => m.quantity <= m.minQuantity)
    .map((m) => ({
      id: m.id,
      name: m.name,
      partNumber: m.partNumber,
      quantity: m.quantity,
      minQuantity: m.minQuantity,
      unit: m.unit,
      location: m.location,
      department: m.department,
      deficit: m.minQuantity - m.quantity,
      severity: (m.quantity === 0 ? "CRITICAL" : "LOW") as "CRITICAL" | "LOW",
      percentOfThreshold: m.minQuantity > 0 ? Math.round((m.quantity / m.minQuantity) * 100) : 0,
    }))
    .sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "CRITICAL" ? -1 : 1;
      return b.deficit - a.deficit;
    });

  return NextResponse.json(alerts);
}