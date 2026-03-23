import { authenticate, getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const result = await authenticate(email, password);
  if (!result) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
  });

  response.cookies.set("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  await logAudit({
    action: "LOGIN",
    entity: "AUTH",
    userId: result.user.id,
    details: JSON.stringify({ email: result.user.email }),
  });

  return response;
}

export async function DELETE() {
  const user = await getCurrentUser();

  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", { maxAge: 0, path: "/" });

  if (user) {
    await logAudit({
      action: "LOGOUT",
      entity: "AUTH",
      userId: user.id,
      details: JSON.stringify({ email: user.email }),
    });
  }

  return response;
}