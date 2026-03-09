import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { materials: true } } },
  });

  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { name, description, color } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  
  try {
    const department = await prisma.department.create({
      data: { name, description: description ?? "", color: color ?? "#6B7280" },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create department";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}