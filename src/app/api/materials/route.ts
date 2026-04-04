import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createMaterialSchema } from "@/lib/validations";

// GET materials with server-side pagination, search, sort, and filtering
export async function GET(req: NextRequest) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
  const search = searchParams.get("search") || "";
  const sortKey = searchParams.get("sortKey") || "";
  const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
  const departmentId = searchParams.get("departmentId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const all = searchParams.get("all") === "true";
  const lowStock = searchParams.get("lowStock") === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  // Text search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { partNumber: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { unit: { contains: search, mode: "insensitive" } },
    ];
  }

  // Department filter
  if (departmentId) {
    where.departmentId = departmentId;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      where.createdAt.gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  // Build orderBy
  const validSortKeys = ["name", "partNumber", "quantity", "unit", "location"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sortKey === "department") {
    orderBy = { department: { name: sortDir } };
  } else if (validSortKeys.includes(sortKey)) {
    orderBy = { [sortKey]: sortDir };
  }

  // If all=true, skip pagination (for CSV export)
  if (all) {
    const materials = await prisma.material.findMany({
      where,
      orderBy,
      include: { department: { select: { id: true, name: true, color: true } } },
    });
    return NextResponse.json(materials);
  }

  // Low stock filter — Prisma can't compare column-to-column, so fetch and filter
  if (lowStock) {
    const allMats = await prisma.material.findMany({
      where,
      orderBy,
      include: { department: { select: { id: true, name: true, color: true } } },
    });
    const filtered = allMats.filter((m) => m.quantity <= m.minQuantity);
    const start = (page - 1) * limit;
    return NextResponse.json({
      materials: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    });
  }
  
  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { department: { select: { id: true, name: true, color: true } } },
    }),
    prisma.material.count({ where }),
  ]);

  return NextResponse.json({ materials, total, page, limit });
}

// POST create a new material
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth("OPERATOR");
  if (error) return error;

  const raw = await req.json();
  const parsed = createMaterialSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { name, partNumber, description, quantity, unit, location, minQuantity, departmentId } = parsed.data;
  
  try {
    const material = await prisma.material.create({
      data: {
        name,
        partNumber, 
        description: description ?? "",
        quantity: quantity ?? 0,
        minQuantity: minQuantity !== undefined ? minQuantity : 10,
        departmentId: departmentId || null,
        unit: unit ?? "pieces",
        location: location ?? "",
      },
    });

    // Log the creation as an inbound movement
    await prisma.movement.create({
      data: {
        type: "INBOUND",
        quantity: quantity ?? 0,
        note: `Initial creation by ${user!.email}`,
        materialId: material.id,
        userId: user!.id
      },
    });

    await logAudit({
      action: "CREATE_MATERIAL",
      entity: "MATERIAL",
      entityId: material.id,
      userId: user!.id,
      details: JSON.stringify({ name, partNumber }),
    });

    return NextResponse.json(material, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}