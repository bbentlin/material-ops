import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const { materials } = await req.json();

  if (!Array.isArray(materials) || materials.length === 0) {
    return NextResponse.json(
      { error: "materials array is required" },
      { status: 400 }
    );
  }

  const results: { row: number; name: string; status: string; error?: string }[] = [];

  for (let i = 0; i < materials.length; i++) {
    const row = materials[i];
    const name = (row.name ?? "").trim();
    const partNumber = (row.partNumber ?? "").trim();

    if (!name || !partNumber) {
      results.push({ row: i + 1, name: name || "(empty)", status: "skipped", error: "Name and part number are required" });
      continue
    }

    try {
      const existing = await prisma.material.findUnique({ where: { partNumber } });
      if (existing) {
        results.push({ row: i + 1, name, status: "skipped", error: "Part number already exists" });
        continue;
      }

      // Resolve department by name if provided
      let departmentId: string | null = null;
      const deptName = (row.department ?? "").trim();
      if (deptName) {
        const dept = await prisma.department.findUnique({ where: { name: deptName } });
        if (dept) {
          departmentId = dept.id;
        }
      }

      const quantity = parseInt(row.quantity, 10) || 0;

      const material = await prisma.material.create({
        data: {
          name,
          partNumber,
          description: (row.description ?? "").trim(),
          quantity,
          minQuantity: parseInt(row.minQuantity, 10) || 10,
          unit: (row.unit ?? "pieces").trim(),
          location: (row.location ?? "").trim(),
          departmentId,
        },
      });

      // Log creation as initial inbound movement
      if (quantity > 0) {
        await prisma.movement.create({
          data: {
            type: "INBOUND",
            quantity,
            note: `CSV import by ${user!.email}`,
            materialId: material.id,
            userId: user!.id,
          },
        });
      }

      results.push({ row: i + 1, name, status: "created" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ row: i + 1, name, status: "error", error: message });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status !== "created").length;

  return NextResponse.json({ created, skipped, results }, { status: 201 });
}