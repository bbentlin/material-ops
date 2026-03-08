import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  const { error, user } = await requireAuth("VIEWER");
  if (error) return error;

  return NextResponse.json(user);
}