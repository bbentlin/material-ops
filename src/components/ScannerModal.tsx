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
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);

  useEffect(() => {
    // Check if BarcodeDetector API is available
    setHasBarcodeDetector("BarcodeDetector" in window);
  }, []);

  async function startCamera() {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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

  function handleManualSubmit(e: React.ChangeEvent) {
    e.preventDefault();
    const value = manualEntry.trim();
    if (value) {
      onResultAction(value);
    }
  }

  const inputClass = 
    "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <DraggableModal title="📷 Scan Barcode / QR Code" onCloseAction={onCloseAction}>
      <div className="space-y-4">
        {/* Camera Scanner */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: 240 }}>
          {scanning ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-60 object-cover"
                muted
                playsInline
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-green-400 rounded-lg opacity-70" />
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                Stop
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              {cameraError ? (
                <p className="text-sm text-red-400 text-center px-4">{cameraError}</p>
              ) : (
                <>
                  <span className="text-4xl mb-2">📷</span>
                  <p className="text-sm mb-3">Scan a barcode or QR code</p>
                </>
              )}
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              > 
                {cameraError ? "Try Again" : "Start Camera"}
              </button>
              {!hasBarcodeDetector && !cameraError && (
                <p className="text-xs text-gray-500 mt-2">
                  BarcodeDetector API not available - use Chrome or Edge for scanning
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or enter manually</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
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
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0"
          > 
            Look Up
          </button>
        </form>
      </div>
    </DraggableModal>
  );
}