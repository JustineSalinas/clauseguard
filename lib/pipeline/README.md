# Pipeline stages

**Owner:** Navarro

The pipeline stages, in order: extract, segment, ground, score, and the
optional negotiate stage that comes only after all five objectives are met.

Each stage writes its results and advances document status in the same
transaction. Transitions are guarded inside the mutation that performs them by
checking current status, never trusted from the caller.

State machine:

    uploaded -> extracting -> extracted -> segmenting -> segmented
                    |                          |
                    v                          v
                failed(extract)            failed(segment)

    segmented -> scoring -> complete
                    |
                    +-> partial       some clauses scored, some failed
                    +-> failed(score)

`partial` is a first class state, not an error. A clause that failed to score is
a clause at maximum uncertainty and routes to human review, which is the same
code path Objective 2 already needs. One mechanism serves both, and the
unanalyzed count becomes a reportable per-model statistic.
