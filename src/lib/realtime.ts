import Ably from "ably";

let ably: InstanceType<typeof Ably.rest> | null = null;

function getAblyClient() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) return null;

  if (!ably) {
    ably = new Ably.Rest(apiKey);
  }

  return ably;
}

export type RealtimeEntity = "materials" | "movements" | "users" | "purchase-orders";

export async function broadcastChange(entity: RealtimeEntity) {
  const client = getAblyClient();
  if (!client) return;

  try {
    const channel = client.channels.get("dashboard");
    await channel.publish("data-changed", { entity, at: Date.now() });
  } catch (err) {
    console.error("Failed to broadcast realtime changes:", err);
  }
}