/**
 * Pure helpers for judging a page photo before upload. No DOM access, so they
 * run under plain `node --test`. The browser side that feeds them pixels is
 * lib/image-prep.ts.
 *
 * The thresholds are heuristics, not calibrated against real scans yet: they
 * are deliberately lenient (warn on clearly bad shots only) and a warning
 * never blocks an upload.
 */

/** Longest edge, in px, a page photo is scaled down to before upload. Plenty
 *  for the vision OCR to read body text; phone cameras shoot 3-4x that. */
export const MAX_EDGE = 2200;

/** Scales (w, h) so the longest edge is at most `maxEdge`. Never upscales. */
export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height, scaled: false };
  const k = maxEdge / longest;
  return { width: Math.round(width * k), height: Math.round(height * k), scaled: true };
}

/** RGBA pixels -> 8-bit luminance. */
export function toGray(rgba: Uint8ClampedArray | Uint8Array): Uint8Array {
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    out[j] = (rgba[i] * 299 + rgba[i + 1] * 587 + rgba[i + 2] * 114) / 1000;
  }
  return out;
}

/** Mean brightness, 0-255. */
export function meanBrightness(gray: Uint8Array): number {
  if (gray.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  return sum / gray.length;
}

/** Variance of the 4-neighbour Laplacian: low means few sharp edges, i.e.
 *  blur. Compare only images analysed at a similar size. */
export function laplacianVariance(gray: Uint8Array, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const v = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

export const BLUR_BELOW = 20;
export const DARK_BELOW = 70;

/** A human-readable warning for a clearly bad page photo, or null. */
export function qualityWarning(gray: Uint8Array, width: number, height: number): string | null {
  if (meanBrightness(gray) < DARK_BELOW) {
    return "This photo looks too dark. Move to better light and retake it.";
  }
  if (laplacianVariance(gray, width, height) < BLUR_BELOW) {
    return "This photo looks blurry. Hold the phone steady and retake it.";
  }
  return null;
}
