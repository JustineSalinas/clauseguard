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
