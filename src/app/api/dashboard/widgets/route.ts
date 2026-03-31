import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Run all queries in parallel
  const [
    allMaterials,
    recentMovements,
    posByStatus,
    recentPOs,
  ] = await Promise.all([
    prisma.material.findMany({
      select: { id: true, name: true, partNumber: true, quantity: true, minQuantity: true },
    }),
    prisma.movement.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { type: true, quantity: true, materialId: true },
    }),
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        supplier: true,
        status: true,
        totalItems: true,
        createdAt: true,
      },
    }),
  ]);

  // --- PO Summary ---
  const poSummary: Record<string, number> = {
    DRAFT: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    RECEIVED: 0,
    CANCELLED: 0,
  };
  for (const row of posByStatus) {
    poSummary[row.status] = row._count.id;
  }

  // --- Top Movers (last 30 days) ---
  const movementsByMaterial = new Map<string, { inbound: number; outbound: number }>();
  for (const m of recentMovements) {
    const entry = movementsByMaterial.get(m.materialId) || { inbound: 0, outbound: 0 };
    if (m.type === "INBOUND") entry.inbound += m.quantity;
    else if (m.type === "OUTBOUND") entry.outbound += m.quantity;
    movementsByMaterial.set(m.materialId, entry);
  }

  const materialMap = new Map(allMaterials.map((m) => [m.id, m]));
  const topMovers = [...movementsByMaterial.entries()]
    .map(([id, counts]) => {
      const mat = materialMap.get(id);
      return {
        id,
        name: mat?.name ?? "Unknown",
        partNumber: mat?.partNumber ?? "",
        totalMovement: counts.inbound + counts.outbound,
        inbound: counts.inbound,
        outbound: counts.outbound,
      };
    })
    .sort((a, b) => b.totalMovement - a.totalMovement)
    .slice(0, 5);
  
  // --- Stock Velocity (inbound vs outbound totals last 30 days) ---
  const stockVelocity = {
   totalInbound: recentMovements
     .filter((m) => m.type === "INBOUND")
     .reduce((s, m) => s + m.quantity, 0),
   totalOutbound: recentMovements
     .filter((m) => m.type === "OUTBOUND")
     .reduce((s, m) => s + m.quantity, 0),
   totalTransfers: recentMovements
     .filter((m) => m.type === "TRANSFER")
     .reduce((s, m) => s + m.quantity, 0),
   periodDays: 30,
  };

  // --- Inventory Health ---
  const total = allMaterials.length;
  const critical = allMaterials.filter((m) => m.quantity === 0 && m.minQuantity > 0).length;
  const low = allMaterials.filter((m) => m.quantity > 0 && m.quantity <= m.minQuantity).length;
  const healthy = total - critical - low;

  const inventoryHealth = {
   total,
   healthy, 
   low,
   critical,
   healthPercent: total > 0 ? Math.round((healthy / total) * 100) : 100,
  };

  return NextResponse.json({
   poSummary,
   recentPOs,
   topMovers,
   stockVelocity,
   inventoryHealth,
  });
}