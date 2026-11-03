"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPT =
  "application/pdf,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_BYTES) {
      setError(`File is ${formatFileSize(file.size)}. ClauseGuard accepts contracts up to 10 MB.`);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
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

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  async function handleUpload() {
    if (!selectedFile) return;

    setPending(true);
    setError(null);
    setUploadStep("Securing document storage…");

    try {
      const uploadUrl = await generateUploadUrl();

      setUploadStep("Uploading file…");
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type || "application/pdf" },
        body: selectedFile,
      });

      if (!result.ok) throw new Error("Upload failed.");
      const { storageId } = await result.json();

      setUploadStep("Starting statutory analysis…");
      const documentId = await createDocument({
        filename: selectedFile.name,
        storageId,
      });

      await startPipeline({ documentId });

      router.push(`/dashboard/${documentId}`);
    } catch {
      setError("Unable to process the document upload. Please try again.");
      setPending(false);
      setUploadStep(null);
    }
  }

  const isPdf =
    selectedFile?.type === "application/pdf" ||
    selectedFile?.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Main Drag-and-Drop Area */}
      {!selectedFile ? (
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
            or <span className="font-medium text-[#b04000] underline underline-offset-4">browse files</span> from your computer
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-[0.75rem] font-medium text-ink-2">
              <FileText className="size-3.5 text-[#b04000]" />
              PDF Documents
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-[0.75rem] font-medium text-ink-2">
              <ImageIcon className="size-3.5 text-[#b04000]" />
              Photos / Scans (OCR)
            </span>
            <span className="rounded-full bg-raised px-2.5 py-1 font-mono text-[0.6875rem] font-medium text-ink-3">
              Up to 10 MB
            </span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="rounded-xl border border-rule bg-surface p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
                {isPdf ? <FileText className="size-6" /> : <ImageIcon className="size-6" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{selectedFile.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[0.75rem] text-ink-3">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-[#0c8c5e]">
                    <CheckCircle2 className="size-3" />
                    {isPdf ? "PDF Document (Vector Highlight)" : "Scanned Image (Vision OCR)"}
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
                    setSelectedFile(null);
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
        </div>
      )}

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
