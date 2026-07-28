"use client";

import DraggableModal from "./DraggableModal";

const shortcuts: { keys: string; description: string }[] = [
  { keys: "/", description: "Focus the search field" },
  { keys: "n", description: "Add a new material" },
  { keys: "s", description: "Open the barcode/QR scanner" },
  { keys: "o", description: "Go to purchase orders" },
  { keys: "u", description: "Go to user management (admin)" },
  { keys: "t", description: "Toggle dark mode" },
  { keys: "?", description: "Show this panel" },
  { keys: "Esc", description: "Close the open dialog" },
];

export default function KeyboardShortcutsModal({
  onCloseAction,
}: {
  onCloseAction: () => void;
}) {
  return (
    <DraggableModal onCloseAction={onCloseAction} labelledBy="shortcuts-title">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onCloseAction}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {shortcuts.map((s) => (
            <li key={s.keys} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">{s.description}</span>
              <kbd className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </DraggableModal>
  );
}