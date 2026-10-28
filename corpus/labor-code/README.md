# Labor Code provisions

**Owner:** Salinas
**Task:** T8

## Source and scope

Verbatim text of Presidential Decree No. 442 (the Labor Code of the
Philippines), scraped from the official text at lawphil.net
(`https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html`) and parsed
article-by-article with a script.

**Renumbering warning:** the lawphil source carries PD 442's *original* 1974
article numbers. DOLE Department Advisory No. 01, Series of 2015 renumbered
Book VI onward — the article everyone actually cites today as "Article 297"
(termination by employer) was originally Article 282 in that source text.
`scripts/parse-labor-code` (the one-off extraction, not checked in — see
git history if it needs re-running) applies the known old→new mapping below
before writing `data/provisions.json`, so every record here is stored under
its **current, renumbered** article number with the original preserved in
`former_article` for citation-checking:

| Current | Former | Covers |
|---|---|---|
| 294 | 279 | Security of tenure |
| 295 | 280 | Regular and casual employment |
| 296 | 281 | Probationary employment |
| 297 | 282 | Termination by employer (just causes) |
| 298 | 283 | Closure / retrenchment |
| 299 | 284 | Disease as ground for termination |
| 106–109 | *(unrenumbered — before the Book VI shift point)* | Contracting/subcontracting, solidary liability |

Scope is intentionally narrow: ClauseGuard's contracts are freelance/
consulting agreements, which are normally governed by the Civil Code of
obligations and contracts, not an employer–employee relationship. The Labor
Code is cited here only where it's actually relevant — contracting-out
liability (Arts. 106–109) and the termination-of-employment cluster
(Arts. 294–299), which matters when a contract's terms suggest
misclassification or get cited by analogy (as in the Civil Code Art. 1306 +
jurisprudence non-compete grounding already used in the sample inspector).

10 articles total. `data/provisions.json`.

## Chunking strategy

One article = one chunk, same rationale as `corpus/civil-code/` — each
article is already a self-contained rule. Unlike the Civil Code source, this
one carries a short italicized heading per article in the original text
(e.g. "Security of tenure."), which is split out into the `heading` field
rather than left inline in `text`.

Each record:
```json
{
  "code": "LABOR",
  "article": "297",
  "former_article": "282",
  "heading": "Termination by employer",
  "text": "An employer may terminate an employment for any of the following causes..."
}
```

## Loading

Same `npm run seed:corpus` script as the Civil Code — see
`corpus/civil-code/README.md` for the loader and the embedding caveat.
`former_article` is kept in the JSON for traceability but is not a column on
`public.provisions`; the seed script drops it before upserting.
