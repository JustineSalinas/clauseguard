"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadContract, type UploadState } from "@/app/dashboard/upload/actions";

/**
 * The submit button doubles as the progress indicator.
 *
 * Extraction, segmentation and scoring all happen inside this one request, so
 * the wait is real -- tens of seconds for a long contract. Saying "Reading
 * your contract" rather than showing a spinner is the difference between a
 * pause that looks deliberate and one that looks broken.
 */
function Submit({ hasFile }: { hasFile: boolean }) {
  const status = useFormStatus();
  return (
    <Button type="submit" size="hero" variant="brand" disabled={status.pending || !hasFile}>
      {status.pending ? "Reading your contract…" : "Upload and review"}
    </Button>
  );
}

export function UploadForm() {
  const [state, action] = useActionState<UploadState, FormData>(uploadContract, undefined);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <Button type="button" variant="outline" size="hero" onClick={() => inputRef.current?.click()}>
          {fileName ? "Choose a different file" : "Choose a PDF"}
        </Button>
        <Submit hasFile={fileName !== null} />
      </div>

      {fileName ? (
        <p className="truncate text-[0.875rem] text-ink-2">{fileName}</p>
      ) : (
        <p className="text-[0.8125rem] text-ink-3">
          PDF, up to 10 MB. A scanned contract has no text layer to read, so it
          needs to be a PDF exported from a document rather than photographed.
        </p>
      )}

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state?.notice ? (
        <Alert>
          <AlertDescription>{state.notice}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
