/**
 * Maps segmented clauses back onto the tokens they came from, so a clause can
 * be drawn over the page it was read from.
 *
 * Segmentation deliberately loses position: segmentClauses() takes a string
 * and returns clause text with the numbering stripped and whitespace
 * collapsed. Extraction, though, recorded where every visible token sat. This
 * module rejoins the two.
 *
 * Doing it by searching a normalised character stream -- rather than by
 * re-running segmentation over the tokens -- keeps segmentation a pure
 * string function that unit tests without a PDF, and keeps this geometry
 * concern out of it. It is also why the heat map is a lookup rather than the
 * fuzzy alignment against a re-rendered page that PLAN.md prices at six days.
 *
 * Pure and Supabase-free, like the stages either side of it.
 */

import type { BoundingBox } from "@/lib/types";
import type { ExtractedToken } from "@/lib/pipeline/extract";

export type ClauseLocation = {
  /** Page the clause starts on. Multi-page clauses keep a box per page. */
  page: number;
  /** Offsets into the extraction's text, for clauses.char_start/char_end. */
  charStart: number | null;
  charEnd: number | null;
  /** One union box per page the clause touches, so a clause spanning a page
   *  break draws as two rectangles rather than one impossible one. */
  boxes: BoundingBox[];
};

/** Same normalisation segmentClauses() applies when it joins a clause's
 *  lines, so the needle and the haystack are directly comparable. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Merges boxes into one rectangle per page. A clause is a run of tokens on
 *  one or two pages, and a caller wants the region, not fifty word boxes. */
export function unionByPage(boxes: BoundingBox[]): BoundingBox[] {
  const byPage = new Map<number, BoundingBox>();

  for (const box of boxes) {
    const existing = byPage.get(box.page);
    if (!existing) {
      byPage.set(box.page, { ...box });
      continue;
    }
    const x = Math.min(existing.x, box.x);
    const y = Math.min(existing.y, box.y);
    const right = Math.max(existing.x + existing.w, box.x + box.w);
    const bottom = Math.max(existing.y + existing.h, box.y + box.h);
    byPage.set(box.page, { page: box.page, x, y, w: right - x, h: bottom - y });
  }

  return [...byPage.values()].sort((a, b) => a.page - b.page);
}

/**
 * Locates each clause in the token stream, in document order.
 *
 * The cursor only moves forward. Clauses arrive in the order they appear, so
 * a forward-only search stops a short clause ("2. Payment.") from matching an
 * earlier identical phrase and dragging every subsequent clause's geometry
 * backwards with it.
 *
 * A clause that cannot be located yields empty boxes rather than throwing.
 * That degrades to Objective 1's documented list-view fallback -- the review
 * is still fully readable without an overlay, so losing geometry must never
 * cost the user the analysis itself.
 */
export function locateClauses(
  clauseTexts: string[],
  tokens: ExtractedToken[],
): ClauseLocation[] {
  const visible = tokens.filter(
    (t) => t.suppressed === null && t.start !== null && t.bbox !== null,
  );

  // A character stream of the visible tokens, plus the token each character
  // belongs to, so a match range converts straight back into token indices.
  let stream = "";
  const owner: number[] = [];

  visible.forEach((token, index) => {
    const piece = normalize(token.text);
    if (piece === "") return;
    if (stream !== "") {
      stream += " ";
      owner.push(index);
    }
    stream += piece;
    for (let i = 0; i < piece.length; i++) owner.push(index);
  });

  let cursor = 0;

  return clauseTexts.map((clauseText) => {
    const needle = normalize(clauseText);
    const empty: ClauseLocation = { page: 1, charStart: null, charEnd: null, boxes: [] };
    if (needle === "") return empty;

    let at = stream.indexOf(needle, cursor);
    // Fall back to a search from the start before giving up: segmentation can
    // legitimately reorder nothing, but a token whose whitespace normalised
    // differently could push a match behind the cursor.
    if (at === -1) at = stream.indexOf(needle);
    if (at === -1) return empty;

    cursor = at + needle.length;

    const firstToken = owner[at];
    const lastToken = owner[Math.min(at + needle.length - 1, owner.length - 1)];
    if (firstToken === undefined || lastToken === undefined) return empty;

    const covering = visible.slice(firstToken, lastToken + 1);
    if (covering.length === 0) return empty;

    return {
      page: covering[0].page,
      charStart: covering[0].start,
      charEnd: covering[covering.length - 1].end,
      boxes: unionByPage(covering.map((t) => t.bbox as BoundingBox)),
    };
  });
}
