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
    <div>
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

  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div>
      <span>{icons[message.type]}</span>
      <span>{message.text}</span>
      <button>
        ✕
      </button>
    </div>
  );
}