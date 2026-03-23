import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const [totalMaterials, allMaterials] = await Promise.all([
    prisma.material.count(),
    prisma.material.findMany({
      select: { quantity: true, minQuantity: true, departmentId: true },
    }),
  ]);

  const totalStock = allMaterials.reduce((sum, m) => sum + m.quantity, 0);
  const lowStockCount = allMaterials.filter(
    (m) => m.quantity <= m.minQuantity
  ).length;

  // Stock by department for chart
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });

  const stockByDepartment = departments
    .map((dept) => {
      const total = allMaterials
        .filter((m) => m.departmentId === dept.id)
        .reduce((sum, m) => sum + m.quantity, 0);
      return { name: dept.name, color: dept.color, total };
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  const unassignedStock = allMaterials
    .filter((m) => !m.departmentId)
    .reduce((sum, m) => sum + m.quantity, 0);
  if (unassignedStock > 0) {
    stockByDepartment.push({ name: "Unassigned", color: "#9CA3AF", total: unassignedStock });
  }

  return NextResponse.json({
    totalMaterials,
    totalStock,
    lowStockCount,
    stockByDepartment,
  });
}