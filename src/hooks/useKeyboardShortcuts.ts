"use client";

import { useEffect } from "react";

type ShortcutHandlers = {
  onFocusSearch: () => void;
  onNewMaterial?: () => void;
  onOpenScanner: () => void;
  onOpenOrders: () => void;
  onOpenUsers?: () => void;
  onToggleDarkMode: () => void;
  onShowHelp: () => void;
  enabled?: boolean;
};

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onNewMaterial,
  onOpenScanner,
  onOpenOrders,
  onOpenUsers,
  onToggleDarkMode,
  onShowHelp,
  enabled=true,
}: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const typing = isTypingTarget(document.activeElement);

      // Ignore everything else while typing or when modifier keys are held
      // (avoids clobbering browser/OS shortcuts like Cmd+R, Ctrl+F, etc.)
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "n":
          if (onNewMaterial) {
            e.preventDefault();
            onNewMaterial();
          }
          break;
        case "s":
          e.preventDefault();
          onOpenScanner();
          break;
        case "o":
          e.preventDefault();
          onOpenOrders();
          break;
        case "u":
          if (onOpenUsers) {
            e.preventDefault();
            onOpenUsers();
          }
          break;
        case "t":
          e.preventDefault();
          onToggleDarkMode();
          break;
        case "?":
          e.preventDefault();
          onShowHelp();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onFocusSearch, onNewMaterial, onOpenScanner, onOpenOrders, onOpenUsers, onToggleDarkMode, onShowHelp]);
}