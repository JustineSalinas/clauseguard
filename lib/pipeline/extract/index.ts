/**
 * The extraction stage. Pure function: given PDF bytes, produce page text,
 * per-token bounding boxes, and page geometry. No Supabase import here on
 * purpose -- same convention as lib/pipeline/segment, so this runs and unit
 * tests under plain `node --test` with no database and no network.
 *
 * Engine choice (T3) is the PDF text layer via pdfjs, not a cloud OCR. Three
 * reasons, in order of weight:
 *
 *   1. A rasterising OCR cannot see text that was never painted visibly.
 *      White-on-white and 1pt payloads would be invisible to the pipeline as
 *      well as to the reader, suppressed_token_count would sit at zero
 *      forever, and eval/adversarial/ would have nothing to detect. The
 *      injection research needs the text layer specifically.
 *   2. Per-token boxes fall out of the text layer's transform matrices, so
 *      Objective 1's overlay is a mapping job rather than fuzzy string
 *      alignment against a re-rendered page.
 *   3. No API key, no per-page cost, no network -- which is what lets the
 *      Day 14 demo run with the network disabled.
 *
 * The cost is scanned documents: an image-only PDF yields no text layer and
 * lands in NoTextDetected, which PLAN.md's error map already treats as a
 * reject-at-upload terminal state. An OCR fallback slots in behind this same
 * interface later without changing callers.
 */

import {
  getDocument,
  OPS,
  type PDFPageProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import type { BoundingBox } from "@/lib/types";

/** Why a token was withheld from the text handed to the model. */
export type SuppressionReason = "tiny" | "invisible" | "offpage";

export type ExtractedToken = {
  page: number;
  text: string;
  /** Offsets into ExtractionResult.text. Null for suppressed tokens, which
   *  never enter that string. This is what makes the Day 6 overlay a
   *  clause-span -> token-range -> box-union lookup. */
  start: number | null;
  end: number | null;
  /** Null only for off-page tokens: pdfjs culls them before geometry is
   *  computed, so there is no box to record. */
  bbox: BoundingBox | null;
  fontSize: number;
  suppressed: SuppressionReason | null;
};

export type PageSize = { page: number; width: number; height: number };

export type ExtractionResult = {
  /** Visible text only. This is what segmentation and scoring ever see. */
  text: string;
  /** Every token, including suppressed ones, so the suppressed set can be
   *  inspected and reported rather than merely dropped. */
  tokens: ExtractedToken[];
  pageSizes: PageSize[];
  suppressedTokenCount: number;
  /** Written to extractions.ocr_engine. Version included because a pdfjs
   *  upgrade can change text-layer output, and boxes are only valid for the
   *  extraction that produced them. */
  engine: string;
};

export class NoTextDetectedError extends Error {
  constructor() {
    super("No text layer found. This looks like a scanned document.");
    this.name = "NoTextDetectedError";
  }
}

export class EncryptedDocumentError extends Error {
  constructor() {
    super("This PDF is password protected.");
    this.name = "EncryptedDocumentError";
  }
}

/** Pinned in the engine string so a pdfjs upgrade is visible in the data.
 *  Boxes are only valid for the extraction that produced them, and a
 *  text-layer change is exactly the kind of thing that invalidates them. */
const PDFJS_VERSION = "6.3";

/** Below this, text is present for a machine but not for a person. The
 *  smallest type used legitimately in a contract is around 6pt for a
 *  footnote; 1pt is the documented injection technique. */
const MIN_VISIBLE_PT = 4;

/** How close to the page background a fill has to be before the text is
 *  treated as invisible. Assumes a white page, which is what a contract is.
 *  A genuinely dark-background document would defeat this -- a Limitations
 *  sentence, not a bug to chase. */
const INVISIBLE_LUMINANCE = 0.95;

/** pdfjs normalises every fill colour space to an RGB hex string, so `1 g`
 *  (grayscale white) and `1 1 1 rg` both arrive here as "#ffffff". Verified
 *  against pdfjs 6.3, rather than assumed -- it is why only setFillRGBColor
 *  needs handling and setFillGray / setFillCMYKColor do not. */
function luminanceOf(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

type OperatorRun = { text: string; fill: string };

/**
 * The sequence of text runs a page actually paints, with the fill colour in
 * force for each.
 *
 * This is the authoritative list, and it is deliberately not getTextContent().
 * getTextContent() silently drops any run positioned outside the page box, so
 * an off-page payload is absent from it entirely -- verified against pdfjs
 * 6.3 for all four directions. Reading the operator list is the only way to
 * know such a run existed at all, which is what makes an off-page token
 * countable instead of merely gone.
 */
async function readOperatorRuns(page: PDFPageProxy): Promise<OperatorRun[]> {
  const ops = await page.getOperatorList();
  const runs: OperatorRun[] = [];
  // PDF's initial fill colour is black, per the spec's graphics state.
  let fill = "#000000";

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i] as unknown[];

    if (fn === OPS.setFillRGBColor) {
      if (typeof args?.[0] === "string") fill = args[0];
      continue;
    }

    if (fn === OPS.showText || fn === OPS.showSpacedText) {
      const glyphs = args?.[0];
      if (!Array.isArray(glyphs)) continue;
      const text = glyphs
        .map((g) =>
          g && typeof g === "object" && "unicode" in g
            ? String((g as { unicode?: string }).unicode ?? "")
            : "",
        )
        .join("");
      if (text.trim() !== "") runs.push({ text, fill });
    }
  }

  return runs;
}

/** Converts a text item's transform into a box in page fractions, with the
 *  origin moved from PDF's bottom-left to the top-left the overlay uses. */
function toBoundingBox(
  transform: number[],
  width: number,
  height: number,
  page: number,
  pageWidth: number,
  pageHeight: number,
): BoundingBox {
  const x = transform[4];
  const yFromBottom = transform[5];
  return {
    page,
    x: x / pageWidth,
    y: (pageHeight - yFromBottom - height) / pageHeight,
    w: width / pageWidth,
    h: height / pageHeight,
  };
}

export async function extractPdf(data: Uint8Array): Promise<ExtractionResult> {
  let doc;
  try {
    doc = await getDocument({
      data,
      useSystemFonts: false,
      // Rendering never happens here, so font faces are pure overhead.
      disableFontFace: true,
    }).promise;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      String((error as { name: string }).name).includes("Password")
    ) {
      throw new EncryptedDocumentError();
    }
    throw error;
  }

  const tokens: ExtractedToken[] = [];
  const pageSizes: PageSize[] = [];
  const parts: string[] = [];
  let cursor = 0;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const [x0, y0, x1, y1] = page.view;
    const pageWidth = x1 - x0;
    const pageHeight = y1 - y0;
    pageSizes.push({ page: pageNum, width: pageWidth, height: pageHeight });

    const runs = await readOperatorRuns(page);
    const content = await page.getTextContent();

    // Items carrying no text are positioning artifacts, not tokens.
    const items = content.items.filter(
      (i): i is Extract<typeof i, { str: string }> =>
        "str" in i && i.str.trim() !== "",
    );

    // Match operator runs to text-content items by their text, consuming each
    // item once. Matching by index would be wrong: the two lists have
    // different lengths whenever a run was culled for being off-page, and
    // every token after the first such run would take the wrong geometry.
    const unclaimed = items.map((item, index) => ({ item, index, taken: false }));

    for (const run of runs) {
      const needle = run.text.trim();
      const match = unclaimed.find((c) => !c.taken && c.item.str.trim() === needle);

      if (!match) {
        // Present in the paint list, absent from the text layer: pdfjs culled
        // it for sitting outside the page box.
        tokens.push({
          page: pageNum,
          text: run.text,
          start: null,
          end: null,
          bbox: null,
          fontSize: 0,
          suppressed: "offpage",
        });
        continue;
      }

      match.taken = true;
      const { item } = match;
      const transform = item.transform as number[];
      const fontSize = Math.hypot(transform[2], transform[3]);

      const suppressed: SuppressionReason | null =
        fontSize > 0 && fontSize < MIN_VISIBLE_PT
          ? "tiny"
          : luminanceOf(run.fill) >= INVISIBLE_LUMINANCE
            ? "invisible"
            : null;

      if (suppressed) {
        tokens.push({
          page: pageNum,
          text: item.str,
          start: null,
          end: null,
          bbox: toBoundingBox(transform, item.width, item.height, pageNum, pageWidth, pageHeight),
          fontSize,
          suppressed,
        });
        continue;
      }

      const start = cursor;
      parts.push(item.str);
      cursor += item.str.length;
      // hasEOL is what preserves line structure, and segmentation depends on
      // it: segmentClauses() looks for a clause number at the start of a
      // line, so a document flattened to one line segments into one clause.
      if (item.hasEOL) {
        parts.push("\n");
        cursor += 1;
      }

      tokens.push({
        page: pageNum,
        text: item.str,
        start,
        end: start + item.str.length,
        bbox: toBoundingBox(transform, item.width, item.height, pageNum, pageWidth, pageHeight),
        fontSize,
        suppressed: null,
      });
    }
  }

  const text = parts.join("");
  const suppressedTokenCount = tokens.filter((t) => t.suppressed !== null).length;

  // A document whose every token was suppressed is not an empty document --
  // it is a document made entirely of hidden text, which is a finding, not a
  // NoTextDetected. Only a genuine absence of a text layer throws.
  if (tokens.length === 0) throw new NoTextDetectedError();

  return {
    text,
    tokens,
    pageSizes,
    suppressedTokenCount,
    engine: `pdfjs-text-layer@${PDFJS_VERSION}`,
  };
}

export { MIN_VISIBLE_PT, INVISIBLE_LUMINANCE, luminanceOf };
