"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

export default function ConfirmDialog({
  title,
  message,
  details,
  confirmLabel = "Delete",
  danger = true,
  onConfirmAction,
  onCloseAction,
}: {
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  danger?: boolean;
  onConfirmAction: () => Promise<void> | void;
  onCloseAction: () => void;
}) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      setError("");
      try {
        await onConfirmAction();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <DraggableModal onCloseAction={onCloseAction} labelledBy="confirm-dialog-title">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>

        {details && details.length > 0 && (
          <ul className="list-disc space-y-1 rounded-md border border-gray-200 bg-gray-50 p-3 pl-8 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}

        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            disabled={isPending}
            className="flex-1 rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex-1 rounded py-2 text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}