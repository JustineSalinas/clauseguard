"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CameraCapture } from "@/components/upload/camera-capture";
import { prepareImage } from "@/lib/image-prep";
import {
  Camera,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  ArrowUp,
  ArrowDown,
  Plus,
} from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB across a multi-page set
const MAX_PAGES = 20;
const ACCEPT =
  "application/pdf,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

function isPdfFile(f: File): boolean {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadForm() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const startPipeline = useAction(api.pipeline.start);
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  // Quality warnings (blurry / dark) by prepared File; advisory, never blocks.
  const [warnings, setWarnings] = useState<Map<File, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files[0] ?? null;

  // Thumbnails for page images; revoked whenever the set changes or on unmount.
  const previews = useMemo(
    () => files.map((f) => (isPdfFile(f) ? "" : URL.createObjectURL(f))),
    [files],
  );
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

  const addFiles = useCallback(async (picked: File[]) => {
    if (picked.length === 0) return;
    setError(null);
    // Downscale/compress page photos and check them before the size limits
    // apply, so an oversized phone photo no longer has to be rejected.
    const prepared = await Promise.all(
      picked.map((f) => (isPdfFile(f) ? { file: f, warning: null } : prepareImage(f))),
    );
    const incoming = prepared.map((p) => p.file);
    const newWarnings = prepared.filter((p) => p.warning).map((p) => [p.file, p.warning!] as const);
    if (newWarnings.length) setWarnings((w) => new Map([...w, ...newWarnings]));
    setFiles((current) => {
      const next = [...current, ...incoming];
      const hasPdf = next.some(isPdfFile);
      if (hasPdf && next.length > 1) {
        setError("A PDF is uploaded on its own. Photos of pages can be combined, but not with a PDF.");
        return current;
      }
      if (next.length > MAX_PAGES) {
        setError(`You can combine up to ${MAX_PAGES} page photos.`);
        return current;
      }
      const tooBig = next.find((f) => f.size > MAX_BYTES);
      if (tooBig) {
        setError(`${tooBig.name} is ${formatFileSize(tooBig.size)}. ClauseGuard accepts files up to 10 MB each.`);
        return current;
      }
      if (next.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_BYTES) {
        setError("These photos total more than 20 MB. Remove some or use smaller images.");
        return current;
      }
      return next;
    });
  }, []);

  const removeAt = useCallback((i: number) => {
    setFiles((c) => c.filter((_, idx) => idx !== i));
  }, []);

  const move = useCallback((i: number, dir: -1 | 1) => {
    setFiles((c) => {
      const j = i + dir;
      if (j < 0 || j >= c.length) return c;
      const next = [...c];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      addFiles(Array.from(e.dataTransfer.files ?? []));
    },
    [addFiles]
  );

  async function uploadOne(file: File): Promise<string> {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/pdf" },
      body: file,
    });
    if (!result.ok) throw new Error("Upload failed.");
    const { storageId } = await result.json();
    return storageId as string;
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setPending(true);
    setError(null);

    try {
      let documentId;
      if (files.length === 1) {
        setUploadStep("Uploading file…");
        const storageId = await uploadOne(files[0]);
        setUploadStep("Starting the review…");
        documentId = await createDocument({
          filename: files[0].name,
          storageId: storageId as never,
        });
      } else {
        const storageIds: string[] = [];
        for (let i = 0; i < files.length; i++) {
          setUploadStep(`Uploading page ${i + 1} of ${files.length}…`);
          storageIds.push(await uploadOne(files[i]));
        }
        setUploadStep("Starting the review…");
        documentId = await createDocument({
          filename: `${files[0].name} (${files.length} pages)`,
          storageIds: storageIds as never,
        });
      }

      await startPipeline({ documentId });
      router.push(`/dashboard/${documentId}`);
    } catch {
      setError("Unable to process the document upload. Please try again.");
      setPending(false);
      setUploadStep(null);
    }
  }

  const isMulti = files.length > 1;
  const isPdf = selectedFile ? isPdfFile(selectedFile) : false;

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {/* Main Drag-and-Drop Area */}
      {files.length === 0 && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-10 ${
            isDragging
              ? "border-[#b04000] bg-[#fbeee4]/50 scale-[0.99]"
              : "border-rule-2 bg-[#fafbfc] hover:border-[#b04000]/60 hover:bg-[#fafbfc]/80"
          }`}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#fbeee4] text-[#b04000] transition-transform group-hover:scale-105">
            <UploadCloud className="size-7" />
          </div>

          <h3 className="mt-4 font-display text-base font-semibold text-ink">
            {isDragging ? "Drop your contract to begin" : "Drop your contract here"}
          </h3>

          <p className="mt-1 text-[0.875rem] text-ink-2">
            or <span className="font-medium text-[#b04000] underline underline-offset-4">browse files</span> from your computer. Photographing pages? Select them all at once.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-[0.75rem] font-medium text-ink-2">
              <FileText className="size-3.5 text-[#b04000]" />
              PDF Documents
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-[0.75rem] font-medium text-ink-2">
              <ImageIcon className="size-3.5 text-[#b04000]" />
              Photos / scans
            </span>
            <span className="rounded-full bg-raised px-2.5 py-1 font-mono text-[0.6875rem] font-medium text-ink-3">
              Up to 10 MB
            </span>
          </div>
        </div>
      )}

      {/* Camera entry point: laptop webcam, USB camera, or a phone's camera. */}
      {files.length === 0 && (
        <Button
          type="button"
          variant="outline"
          size="hero"
          className="gap-2 self-center"
          onClick={() => setCameraOpen(true)}
        >
          <Camera className="size-4" />
          Scan with your camera
        </Button>
      )}

      {files.length > 0 && (
        /* Selected File Card */
        <div className="rounded-xl border border-rule bg-surface p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
                {isPdf ? <FileText className="size-6" /> : <ImageIcon className="size-6" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">
                  {isMulti ? `${files.length} page photos` : selectedFile!.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[0.75rem] text-ink-3">
                  <span>{formatFileSize(files.reduce((n, f) => n + f.size, 0))}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-[#0c8c5e]">
                    <CheckCircle2 className="size-3" />
                    {isPdf ? "PDF document" : isMulti ? "One contract, in page order" : "Scanned image"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!pending && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="text-ink-3 hover:text-ink"
                >
                  <X className="size-4 mr-1" />
                  Remove
                </Button>
              )}
              <Button
                type="button"
                variant="brand"
                size="hero"
                disabled={pending}
                onClick={handleUpload}
                className="gap-2"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{uploadStep ?? "Processing…"}</span>
                  </>
                ) : (
                  <>
                    <Shield className="size-4" />
                    <span>Upload &amp; Review Contract</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {!isPdf && (
            <div className="mt-4 border-t border-rule pt-4">
              <ol className="flex flex-col gap-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 rounded-lg border border-rule bg-[#fafbfc] p-2">
                    <span className="w-6 text-center font-mono text-[0.75rem] text-ink-3">{i + 1}</span>
                    {previews[i] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previews[i]} alt={`Page ${i + 1} preview`} className="size-12 rounded object-cover" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] text-ink">{f.name}</span>
                      {warnings.get(f) && (
                        <span className="flex items-start gap-1 text-[0.75rem] text-amber-700">
                          <AlertCircle className="mt-0.5 size-3 shrink-0" />
                          {warnings.get(f)}
                        </span>
                      )}
                    </span>
                    {!pending && (
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move page ${i + 1} up`}>
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" disabled={i === files.length - 1} onClick={() => move(i, 1)} aria-label={`Move page ${i + 1} down`}>
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAt(i)} aria-label={`Remove page ${i + 1}`}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {!pending && files.length < MAX_PAGES && (
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-1">
                  {/* max-sm:h-11 -> 44px touch targets on phones; the compact 28px size stays on desktop. */}
                  <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-[#b04000] max-sm:h-11 max-sm:px-3 max-sm:text-[0.875rem]" onClick={() => inputRef.current?.click()}>
                    <Plus className="size-4" />
                    Add another page
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-[#b04000] max-sm:h-11 max-sm:px-3 max-sm:text-[0.875rem]" onClick={() => setCameraOpen(true)}>
                    <Camera className="size-4" />
                    Scan with camera
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(file) => addFiles([file])}
        pageCount={files.length}
        maxPages={MAX_PAGES}
      />

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Privacy guarantee */}
      <div className="flex items-center gap-2 text-[0.75rem] text-ink-3">
        <Shield className="size-3.5 shrink-0 text-[#b04000]" />
        <span>
          Contracts are processed under zero-retention ephemeral privacy. Never shared with third parties or used to train public models.
        </span>
      </div>
    </div>
  );
}
