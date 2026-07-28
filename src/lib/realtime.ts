import Ably from "ably";

if (!process.env.ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY environment variable is required");
}

const ably = new Ably.Rest(process.env.ABLY_API_KEY);

export type RealtimeEntity = "materials" | "movements" | "users" | "purchase-orders";

export async function broadcastChange(entity: RealtimeEntity) {
  try {
    const channel = ably.channels.get("dashboard");
    await channel.publish("data-changed", { entity, at: Date.now() });
  } catch (err) {
    // Never let a broadcast failure break the actual mutation response.
    console.error("Failed to broadcast realtime changes:", err);
  }
}