import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { imageSize, splitPages, isOcrSupportedImage } from "@/lib/pipeline/extract/ocr";

describe("ocr helpers", () => {
  test("splitPages splits on page markers", () => {
    const out = splitPages("=== PAGE 1 ===\nA\n=== PAGE 2 ===\nB");
    assert.deepEqual(out, ["A", "B"]);
  });
  test("splitPages treats unmarked output as one page", () => {
    assert.deepEqual(splitPages("just text"), ["just text"]);
  });
  test("imageSize reads PNG header", () => {
    const b = new Uint8Array(33);
    b.set([0x89, 0x50, 0x4e, 0x47], 0);
    new DataView(b.buffer).setUint32(16, 800);
    new DataView(b.buffer).setUint32(20, 1200);
    assert.deepEqual(imageSize(b), { width: 800, height: 1200 });
  });
  test("imageSize returns null for unknown formats", () => {
    assert.equal(imageSize(new Uint8Array(40)), null);
  });
  test("mime routing", () => {
    assert.equal(isOcrSupportedImage("image/HEIC"), true);
    assert.equal(isOcrSupportedImage("application/pdf"), false);
  });
});

import { stitchPages } from "@/lib/pipeline/extract/ocr";

describe("stitchPages", () => {
  test("joins a sentence that spans a page break", () => {
    assert.equal(stitchPages(["The Client shall pay the", "fees within 30 days."]),
      "The Client shall pay the fees within 30 days.");
  });
  test("keeps a paragraph break after a finished sentence", () => {
    assert.equal(stitchPages(["End of page one.", "2. Next clause."]),
      "End of page one.\n\n2. Next clause.");
  });
  test("skips empty pages", () => {
    assert.equal(stitchPages(["A.", "  ", "B."]), "A.\n\nB.");
  });
});
