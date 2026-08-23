# Segmentation stage

**Owner:** Navarro

Splits extracted text into clauses and assigns a clause_type from the taxonomy.

Writes one row per clause, keyed to the extraction that produced it. Bounding
boxes are valid only for their own extraction, so extraction_id travels with
them. A re-extraction must never render a stale overlay against a newly
rendered page.

Zero clauses detected is a terminal state with an empty state in the UI, not a
crash.
