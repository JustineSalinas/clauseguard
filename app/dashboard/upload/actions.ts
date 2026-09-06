"use server";

/**
 * Upload: validate, store, create the document row, start the pipeline.
 *
 * Ownership is resolved from the verified session here, at the boundary, and
 * never taken from the form. Everything downstream runs as the service role,
 * which bypasses RLS entirely, so this is the last point at which anything is
 * checking who is asking.
 */

import { revalidatePath } from "next/cache";
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline/run";

export type UploadState = { error?: string; notice?: string } | undefined;

/** Vercel's request body ceiling is well under this, and a contract that is
 *  genuinely larger is a scan, which has no text layer to read anyway. Stated
 *  up front in the UI rather than discovered on submit. */
const MAX_BYTES = 10 * 1024 * 1024;

/** A PDF always begins with this signature. Checked against the bytes rather
 *  than the browser-supplied MIME type, which is trivially spoofed and is not
 *  evidence of anything. */
const PDF_MAGIC = "%PDF-";

export async function uploadContract(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF to upload." };
  }

  if (file.size > MAX_BYTES) {
    return {
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_BYTES / 1024 / 1024} MB.`,
    };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const ownerId = claimsData?.claims?.sub;

  if (typeof ownerId !== "string") {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = Buffer.from(bytes.subarray(0, 5)).toString("latin1");

  if (header !== PDF_MAGIC) {
    return { error: "That doesn't look like a PDF. ClauseGuard reads PDF contracts." };
  }

  // Rejected before a document row exists, per PLAN.md's error map: a file
  // that was never going to work should not leave a failed job behind for
  // the user to wonder about.
  if (isEncrypted(bytes)) {
    return {
      error: "This PDF is password protected. Remove the password and upload it again.",
    };
  }

  const documentId = randomUUID();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
  // The first path segment is what the storage RLS policy compares against
  // auth.uid(), so this layout is load-bearing, not cosmetic.
  const storagePath = `${ownerId}/${documentId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("contracts")
    .upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { error: "The upload didn't complete. Try again." };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    owner_id: ownerId,
    filename: file.name,
    storage_path: storagePath,
    content_hash: createHash("sha256").update(bytes).digest("hex"),
    status: "uploaded",
  });

  if (insertError) {
    // Leave no orphaned object behind if the row could not be written.
    await supabase.storage.from("contracts").remove([storagePath]);
    return { error: "The upload couldn't be saved. Try again." };
  }

  // Awaited rather than backgrounded. A serverless function that returns
  // stops executing, so a floating promise here would leave documents stuck
  // in `extracting` forever. Moving this to a queue is the Day 8 change; for
  // one contract at a time it finishes well inside the function timeout.
  try {
    await runPipeline(documentId);
  } catch (error) {
    // The pipeline records its own failure against the document, so the user
    // still sees a real status. Nothing is rethrown into the form.
    console.error(`[upload] pipeline failed for ${documentId}`, error);
  }

  revalidatePath("/dashboard");
  return { notice: "Uploaded. Your review is ready below." };
}

/**
 * True when the PDF declares an /Encrypt dictionary in its trailer.
 *
 * A deliberately shallow check: it catches the password-protected files a
 * user actually uploads without parsing the document. Anything it misses
 * fails a second time in extraction, which reports the same message -- so the
 * cost of a miss is a slower answer, not a wrong one.
 */
function isEncrypted(bytes: Uint8Array): boolean {
  const tail = Buffer.from(bytes.subarray(Math.max(0, bytes.length - 4096))).toString("latin1");
  return /\/Encrypt\b/.test(tail);
}
