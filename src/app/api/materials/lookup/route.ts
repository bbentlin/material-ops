import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("VIEWER");
  if (error) return error;

  const partNumber = new URL(req.url).searchParams.get("partNumber") || "";

  if (!partNumber) {
    return NextResponse.json({ error: "partNumber is required" }, { status: 400 });
  }

  // Try exact match first
  let material = await prisma.material.findUnique({
    where: { partNumber },
    include: { department: { select: { id: true, name: true, color: true } } },
  });

  // If not found, try case-insensitive partial match
  if (!material) {
    material = await prisma.material.findFirst({
      where: { partNumber: { contains: partNumber, mode: "insensitive" } },
      include: { department: { select: { id: true, name: true, color: true } } },
    });
  }

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  return NextResponse.json(material);
}