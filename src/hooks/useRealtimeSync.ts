"use client";

import { useEffect, useRef } from "react";
import type * as Ably from "ably";
import type { RealtimeEntity } from "@/lib/realtime";
import { getAblyClient } from "@/lib/ablyClient";

export function useRealtimeSync(onChangeAction: (entity: RealtimeEntity) => void) {
  const callbackRef = useRef(onChangeAction);
  callbackRef.current = onChangeAction;

  useEffect(() => {
    const client = getAblyClient();
    if (!client) return;

    const channel = client.channels.get("dashboard");
    const listener = (message: Ably.Message) => {
      const payload = message.data as { entity: RealtimeEntity };
      callbackRef.current(payload.entity);
    };

    channel.subscribe("data-changed", listener);

    return () => {
      channel.unsubscribe("data-changed", listener);
    };
  }, []);
}