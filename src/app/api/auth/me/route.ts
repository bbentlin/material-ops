import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error, payload } = await requireAuth("VIEWER");
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: payload!.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}