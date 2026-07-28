"use client";

import * as Ably from "ably";

let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime | null {
  if (typeof window === "undefined") return null;
  if (!process.env.NEXT_PUBLIC_ABLY_KEY) return null;

  if (!client) {
    client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_KEY });
  }
  return client;
}