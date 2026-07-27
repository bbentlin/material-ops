"use client";

import { useEffect, useRef, useState } from "react";
import DraggableModal from "./DraggableModal";

export default function ScannerModal({
  onCloseAction,
  onResultAction,
}: {
  onCloseAction: () => void;
  onResultAction: (partNumber: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [manualEntry, setManualEntry] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);

  const [hasBarcodeDetector] = useState(
    () => typeof window !== "undefined" && "BarcodeDetector" in window
  );

  async function startCamera() {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        startDetection();
      }
    } catch {
      setCameraError("Camera access denied or unavailable. Use manual entry below.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function startDetection() {
    if (!("BarcodeDetector" in window) || !videoRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).BarcodeDetector({
      formats: ["qr_code", "code_128", "ean_13", "ean_8", "code_39"],
    });

    const detect = async () => {
      if (!videoRef.current || !streamRef.current) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const barcodes: any[] = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          stopCamera();
          onResultAction(raw);
          return;
        }
      } catch {
        // detection frame error, continue
      }
      if (streamRef.current) {
        requestAnimationFrame(detect);
      }
    };
    detect();
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = manualEntry.trim();
    if (value) {
      onResultAction(value);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

  return (
    <DraggableModal onCloseAction={onCloseAction} labelledBy="scanner-title">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="scanner-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            📷 Scan Barcode / QR Code
          </h2>
          <button
            onClick={onCloseAction}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
          >
            Close
          </button>
        </div>

        {/* Camera Scanner */}
        <div
          className="relative overflow-hidden rounded-lg bg-black"
          style={{ minHeight: "240px" }}
        >
          {scanning ? (
            <>
              <video
                ref={videoRef}
                className="h-60 w-full object-cover sm:h-80"
                muted
                playsInline
              />
              {/* Scan overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 rounded-lg border-2 border-green-400 opacity-70 sm:h-48 sm:w-48" />
              </div>
              <button
                onClick={stopCamera}
                className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white"
              >
                Stop
              </button>
            </>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center text-gray-400 sm:h-80">
              {cameraError ? (
                <p role="alert" className="px-4 text-center text-sm text-red-400">{cameraError}</p>
              ) : (
                <>
                  <span className="mb-2 text-4xl">📷</span>
                  <p className="mb-3 text-sm">Scan a barcode or QR code</p>
                </>
              )}
              <button
                onClick={startCamera}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                {cameraError ? "Try Again" : "Start Camera"}
              </button>
              {!hasBarcodeDetector && !cameraError && (
                <p className="mt-2 text-xs text-gray-500">
                  BarcodeDetector API not available - use Chrome or Edge for scanning
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or enter manually</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            type="text"
            value={manualEntry}
            onChange={(e) => setManualEntry(e.target.value)}
            placeholder="Type part number..."
            className={inputClass}
            autoFocus={!scanning}
          />
          <button
            type="submit"
            disabled={!manualEntry.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 sm:shrink-0"
          >
            Look Up
          </button>
        </form>
      </div>
    </DraggableModal>
  );
}