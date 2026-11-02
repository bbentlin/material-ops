import Ably from "ably";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  const { error, user } = await requireAuth("VIEWER");
  if (error) return error;

  const key = process.env.ABLY_TOKEN_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Realtime authentication is not configured" },
      { status: 503 },
    );
  }

  const ably = new Ably.Rest(key);
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: user!.id,
    capability: JSON.stringify({ dashboard: ["subscribe"] }),
  });

  return NextResponse.json(tokenRequest);
}