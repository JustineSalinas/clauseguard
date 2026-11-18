"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CameraState = { kind: "starting" } | { kind: "live" } | { kind: "error"; message: string };

const JPEG_QUALITY = 0.92;

function describeCameraError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access was blocked. Allow the camera for this site in your browser's address bar, then try again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "The camera is in use by another app. Close it and try again.";
  }
  return "The camera couldn't be started.";
}

/** "FaceTime HD Camera (1C1C:B782)" -> "FaceTime HD Camera". The trailing hex
 *  vendor:product id means nothing to a reader and eats the status line. */
function friendlyCameraLabel(label: string | undefined): string | undefined {
  const cleaned = label?.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, "").trim();
  return cleaned || undefined;
}

/**
 * Live camera capture for scanning paper contracts: a laptop webcam, an
 * external USB camera, or a phone's rear camera. Each capture is a JPEG File
 * handed to `onCapture`, so it joins the same multi-page set the file picker
 * feeds (upload-form's addFiles) and goes through the same vision-OCR path.
 *
 * The camera stream is only open while the dialog is. Nothing is recorded or
 * uploaded until the user presses Upload on the form.
 */
export function CameraCapture({
  open,
  onOpenChange,
  onCapture,
  pageCount,
  maxPages,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  /** Pages already in the upload set, shown to the user and used to name captures. */
  pageCount: number;
  maxPages: number;
}) {
  // The video element lives in a portal that mounts with the dialog. A callback
  // ref records it, and `videoReady` re-runs the effect once it exists so the
  // effect never reads a ref that hasn't been attached yet.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoReady(el !== null);
  }, []);
  const [state, setState] = useState<CameraState>({ kind: "starting" });
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [requestedId, setRequestedId] = useState<string | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!open || !videoReady || !el) return;

    let cancelled = false;
    let stream: MediaStream | null = null;

    async function start(el: HTMLVideoElement) {
      setState({ kind: "starting" });

      if (!navigator.mediaDevices?.getUserMedia) {
        setState({
          kind: "error",
          message: window.isSecureContext
            ? "This browser doesn't support camera capture."
            : "Camera capture needs a secure (https) connection.",
        });
        return;
      }

      try {
        // Prefer a rear camera on phones; a laptop webcam has no
        // environment-facing camera so the browser just picks the webcam.
        // Ask for HD: contract text is small and a 640x480 frame won't OCR.
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...(requestedId
              ? { deviceId: { exact: requestedId } }
              : { facingMode: { ideal: "environment" } }),
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        el.srcObject = stream;
        await el.play();
        if (cancelled) return;

        setActiveId(stream.getVideoTracks()[0]?.getSettings().deviceId);
        // Device labels and the full list are only available after permission.
        const all = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) setDevices(all.filter((d) => d.kind === "videoinput"));
        setState({ kind: "live" });
      } catch (err) {
        if (!cancelled) setState({ kind: "error", message: describeCameraError(err) });
      }
    }

    void start(el);

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      el.srcObject = null;
    };
  }, [open, videoReady, requestedId, attempt]);

  const switchCamera = useCallback(() => {
    if (devices.length < 2) return;
    const index = devices.findIndex((d) => d.deviceId === activeId);
    setRequestedId(devices[(index + 1) % devices.length].deviceId);
  }, [devices, activeId]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // The preview is deliberately not mirrored, so the saved frame matches
    // what the user sees and the text reads the right way round.
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `camera-scan-page-${pageCount + 1}.jpg`, { type: "image/jpeg" }));
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  }, [onCapture, pageCount]);

  const atLimit = pageCount >= maxPages;
  const multipleCameras = devices.length > 1;
  // Only name the camera once it is actually streaming; `devices` and
  // `activeId` survive a close/reopen, so without this the previous session's
  // camera name sits under a spinner while the new stream is still starting.
  const activeLabel =
    state.kind === "live"
      ? friendlyCameraLabel(devices.find((d) => d.deviceId === activeId)?.label)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* grid-cols-[minmax(0,1fr)]: DialogContent is a one-column grid whose
          track is `auto`, so it grows to its widest child's min-content. That
          let the footer's buttons stretch the whole dialog past the card on a
          phone. A min-0 track keeps every child inside the card's width. The
          max-h + scroll keeps a landscape phone from clipping the footer. */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Scan with your camera</DialogTitle>
          <DialogDescription>
            Fill the frame with one flat page at a time. Nothing uploads until you press Upload.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={attachVideo}
            playsInline
            muted
            className="aspect-[4/3] w-full object-contain sm:aspect-video"
            aria-label="Live camera preview"
          />
          {/* Shutter flash: skipped entirely under prefers-reduced-motion. The
              page count below still announces the capture. */}
          {flash && <div className="pointer-events-none absolute inset-0 bg-white/70 motion-reduce:hidden" />}

          {state.kind === "starting" && (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white/85"
            >
              <Loader2 className="size-6 animate-spin" />
              <p className="max-w-[16rem] text-[0.8125rem]">
                Starting camera… if your browser asks, choose Allow.
              </p>
            </div>
          )}

          {state.kind === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-white">
              <CameraOff className="size-8 text-white/70" />
              <p className="max-w-sm text-[0.875rem]" role="alert">
                {state.message}
              </p>
              <Button type="button" variant="outline" size="hero" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </Button>
            </div>
          )}
        </div>

        {/* Phone: status line, then Capture full width (the primary action,
            thumb-reachable), then Switch + Done sharing a row. sm+: one row.
            All controls are 44px tall (size="hero"); gap-2 keeps the targets apart. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate text-[0.8125rem] text-ink-2" aria-live="polite">
            {pageCount === 0 ? "No pages yet" : `${pageCount} ${pageCount === 1 ? "page" : "pages"} in this contract`}
            {activeLabel ? ` · ${activeLabel}` : ""}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
            <Button
              type="button"
              variant="brand"
              size="hero"
              onClick={capture}
              disabled={state.kind !== "live" || atLimit}
              className="order-first col-span-2 gap-2 sm:order-none sm:col-span-1"
            >
              <Camera className="size-4" />
              {atLimit ? `Page limit (${maxPages}) reached` : "Capture page"}
            </Button>
            {multipleCameras && (
              <Button
                type="button"
                variant="outline"
                size="hero"
                onClick={switchCamera}
                className="gap-1.5 sm:order-first"
              >
                <SwitchCamera className="size-4" />
                Switch camera
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="hero"
              onClick={() => onOpenChange(false)}
              className={multipleCameras ? "" : "col-span-2 sm:col-span-1"}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
