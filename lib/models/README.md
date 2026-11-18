# Model configuration

**Owner:** Salinas

One place, keyed by pipeline stage. Gemini Flash, Gemini Flash-Lite, and
Llama 3.3 70B.

Production stages also live here: scoring (Claude Haiku 5.5), OCR (Gemini 3.5
Flash), and the optional clause segmenter (`SEGMENT_STAGE_MODEL`, Muse Spark 1.1
via the Meta Model API, needs `META_MODEL_API_KEY`). None of those are in
`ABLATION_MODELS`, which stays frozen.

The entire Objective 3 ablation should be a config change. If swapping a model
touches more than one file, the study will not get run three times under
deadline.
