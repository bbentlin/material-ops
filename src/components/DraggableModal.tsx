"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";

export default function DraggableModal({
  children,
  className = "",
  labelledBy,
  onCloseAction,
}: {
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  onCloseAction?: () => void;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const fallbackId = useId();

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;

    const focusable = modalRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? modalRef.current)?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && onCloseAction) {
        onCloseAction();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'input, select, textarea, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCloseAction]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = modalRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relativeY = e.clientY - rect.top;
      if (relativeY > 48) return;

      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? fallbackId}
        tabIndex={-1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          maxHeight: "90vh",
        }}
        className={`w-full max-w-sm overflow-y-auto rounded-lg bg-white shadow-lg select-none dark:bg-gray-800 sm:max-w-lg ${className}`}
      >
        <div
          className="flex justify-center pt-2 pb-0 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        >
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        {children}
      </div>
    </div>
  );
}