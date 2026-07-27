"use client";

import { useEffect } from "react";

export type ToastMessage = {
  id: string;
  text: string;
  type: "success" | "error" | "info";
};

export default function Toast({
  messages,
  onDismissAction,
}: {
  messages: ToastMessage[];
  onDismissAction: (id: string) => void;
}) {
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismissAction={onDismissAction} />
      ))}
    </div>
  );
}

function ToastItem({
  message,
  onDismissAction,
}: {
  message: ToastMessage;
  onDismissAction: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismissAction(message.id), 4000);
    return () => clearTimeout(timer);
  }, [message.id, onDismissAction]);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className="pointer-events-auto flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-700"
    >
      <span aria-hidden="true">{icons[message.type]}</span>
      <span>{message.text}</span>
      <button
        type="button"
        onClick={() => onDismissAction(message.id)}
        aria-label="Dismiss notification"
        className="ml-2 rounded p-0.5 hover:bg-white/10"
      >
        ✕
      </button>
    </div>
  );
}