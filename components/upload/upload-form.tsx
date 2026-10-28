"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "application/pdf,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

/**
 * Supabase's version of this form posted a server action that ran the
 * whole extract -> segment -> score pipeline inline, inside the same
 * request, which is why its button doubled as the only progress
 * indicator. Convex's version uploads the file, creates the document row,
 * and kicks off pipeline.start as a *scheduled* action -- the request
 * returns immediately and the dashboard's status pill is what shows
 * progress from here (see app/dashboard/page.tsx), not this button.
 */
export function UploadForm() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const startPipeline = useAction(api.pipeline.start);
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError("That file is over 10 MB. Try a smaller file.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed.");
      const { storageId } = await result.json();

      const documentId = await createDocument({ filename: file.name, storageId });
      await startPipeline({ documentId });

      router.push(`/dashboard/${documentId}`);
    } catch {
      setError("That upload didn't go through. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null);
            setError(null);
          }}
        />
        <Button type="button" variant="outline" size="hero" onClick={() => inputRef.current?.click()}>
          {fileName ? "Choose a different file" : "Choose a file or photo"}
        </Button>
        <Button type="button" size="hero" variant="brand" disabled={pending || !fileName} onClick={handleUpload}>
          {pending ? "Uploading…" : "Upload and review"}
        </Button>
      </div>

      {fileName ? (
        <p className="truncate text-[0.875rem] text-ink-2">{fileName}</p>
      ) : (
        <p className="text-[0.8125rem] text-ink-3">
          PDF, or a photo (JPG, PNG, HEIC) of a printed page — up to 10 MB. A
          PDF exported from a document gets exact clause highlighting on the
          page; a photo is read with OCR instead, so the review still shows
          every clause and risk, just without that on-page overlay.
        </p>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
