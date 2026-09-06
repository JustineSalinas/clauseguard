# Extraction stage

**Owner:** Navarro  
**Task:** T3

OCR and layout extraction. Writes tokens, per-token bounding boxes, and page
geometry.

The engine choice here prices the heat map. An engine that returns per-token
boxes as a side effect of OCR makes Objective 1 roughly a day of work. A
text-only extractor means deriving coordinates by fuzzy string alignment against
a re-rendered page, which is closer to six days.

Strip invisible and off-page text at this stage. That is the cheapest prompt
injection mitigation available and it belongs here, not in the scoring prompt.

## T3 decision: the PDF text layer, not a cloud OCR

**Decided.** `pdfjs-dist`, reading the embedded text layer. Per-token boxes come
from the transform matrices, so Objective 1's overlay is a lookup rather than
fuzzy alignment. No API key, no per-page cost, no network — which is also what
lets the Day 14 demo run with the network disabled.

The decisive reason is not cost, it is the injection research. A rasterising OCR
sees only what was painted visibly, so white-on-white and 1pt payloads would be
invisible to the pipeline as well as to the reader:
`suppressed_token_count` would sit at zero forever and `eval/adversarial/` would
have nothing to detect. The text layer is the only route that sees them.

The cost is scanned documents. An image-only PDF has no text layer, throws
`NoTextDetectedError`, and is rejected with an actionable message. An OCR
fallback slots in behind the same interface later without changing callers —
`OCR_PROVIDER` / `OCR_API_KEY` stay in `.env.example` for that.

## How each hidden-text technique is caught

Verified against pdfjs 6.3 rather than assumed, because two of the three do not
work the way the obvious implementation would suggest:

| Technique | Signal | Source |
|---|---|---|
| sub-4pt text | font size from the transform scale | `getTextContent()` |
| white-on-white | fill luminance ≥ 0.95 | `getOperatorList()` |
| positioned off page | present when painted, absent from the text layer | both |

Two findings worth keeping in mind before changing this file:

1. **`getTextContent()` does not expose fill colour.** `TextItem` carries
   `str`, `dir`, `transform`, `width`, `height`, `fontName`, `hasEOL` and
   nothing else. Colour only exists in the operator list, so white-on-white
   detection needs that second pass. Building on `getTextContent()` alone would
   pass every test that does not specifically paint white text, then let every
   white-on-white payload through in production.
2. **`getTextContent()` silently drops runs positioned outside the page box** —
   confirmed for all four directions. An off-page payload is simply absent from
   it, so it cannot be counted there. Reading the operator list is what makes an
   off-page run *countable* rather than merely gone, which is what
   `suppressed_token_count` and AUDIT-CHECKLIST section 5 depend on.

Operator runs are matched to text items by their text, consuming each item once,
never by index: the two lists differ in length whenever a run was culled, and an
index-based match would hand every later token the wrong geometry.
