/**
 * Vision-OCR extraction for a photographed or otherwise image-only upload
 * (phone camera shot, a plain JPG/PNG/HEIC) -- the fallback this module's
 * own header comment anticipated: "An OCR fallback slots in behind this
 * same interface later without changing callers." Same ExtractionResult
 * shape as the PDF text-layer path in index.ts, so segmentation, boxes, and
 * scoring don't know or care which one produced it.
 *
 * Never used for a normal PDF upload. index.ts's pdfjs text-layer path is
 * always the primary route for PDFs -- it is what the prompt-injection
 * research (eval/adversarial/) depends on, since only a real text layer can
 * carry invisible/off-page tokens for extraction to suppress and report.
 * OCR cannot see what was never painted visibly, so routing a PDF through
 * this path would silently defeat that research, not just degrade quality.
 *
 * What this path cannot give you, by nature of OCR rather than a missing
 * feature: per-token bounding boxes. There is no clause-overlay highlight
 * on an OCR'd document's own image -- tokens come back empty and boxes
 * stay empty, same as any other suppressed-geometry case this pipeline
 * already treats as a designed state, not a crash.
 */

import { generateText } from "ai";
import { OCR_MODEL, requireApiKeyFor } from "@/lib/models";
import type { ExtractionResult } from "./index";

export class OcrUnreadableError extends Error {
  constructor() {
    super("No readable text could be made out in this image. Try a clearer, better-lit photo.");
    this.name = "OcrUnreadableError";
  }
}

const TRANSCRIBE_PROMPT =
  "Transcribe every word of visible text in this image exactly as it appears, " +
  "preserving line breaks and paragraph structure. This is a photographed or " +
  "scanned contract page. Output only the transcribed text -- no commentary, " +
  "no summary, no markdown formatting. If truly no legible text is visible, " +
  "output exactly: NO_TEXT_FOUND";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isOcrSupportedImage(contentType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.has(contentType.toLowerCase());
}

export async function extractImageOcr(
  bytes: Uint8Array,
  contentType: string,
): Promise<ExtractionResult> {
  requireApiKeyFor(OCR_MODEL);

  const { text } = await generateText({
    model: OCR_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: TRANSCRIBE_PROMPT },
          { type: "image", image: bytes, mediaType: contentType },
        ],
      },
    ],
  });

  const trimmed = text.trim();
  if (!trimmed || trimmed === "NO_TEXT_FOUND") {
    throw new OcrUnreadableError();
  }

  return {
    text: trimmed,
    // No per-token geometry from OCR -- no overlay highlight for this
    // document, the same honest degradation the rest of the pipeline
    // already uses for anything it can't precisely locate.
    tokens: [],
    // Real pixel dimensions aren't read here (no image-dimension library in
    // this stack) and nothing downstream currently uses them for an OCR'd
    // document anyway, since there are no boxes to place against them. A
    // fixed placeholder, not a measurement.
    pageSizes: [{ page: 1, width: 1000, height: 1294 }],
    suppressedTokenCount: 0,
    engine: `vision-ocr@${OCR_MODEL}`,
  };
}
