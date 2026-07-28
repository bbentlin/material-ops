"use client";

import { useEffect, useRef } from "react";
import * as Ably from "ably";
import type { RealtimeEntity } from "@/lib/realtime";

export function useRealtimeSync(onChangeAction: (entity: RealtimeEntity) => void) {
  const callbackRef = useRef(onChangeAction);
  callbackRef.current = onChangeAction;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ABLY_KEY) return;

    const client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_KEY });
    const channel = client.channels.get("dashboard");

    channel.subscribe("data-changed", (message) => {
      const payload = message.data as { entity: RealtimeEntity };
      callbackRef.current(payload.entity);
    });

    return () => {
      channel.unsubscribe();
      client.close();
    };
  }, []);
}