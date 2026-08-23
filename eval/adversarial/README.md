# Adversarial suite

**Owner:** Zallen  
**Task:** T10

Deliberately hostile contracts. Two categories.

1. Obfuscated clauses. Reworded traps, clauses that read benign but are not,
   unusual structure. Output is a documented failure mode table for the
   Limitations chapter.

2. Prompt injection. The party drafting a contract has direct motive to defeat
   an analyzer. A PDF can carry text rendered invisible, white on white, at one
   point size, or positioned off page, instructing the model to classify
   everything as low risk.

The second category is the most distinctive thing in this project. Contract
review inherited its threat model from summarization, where nobody benefits from
the model being wrong. Here the counterparty benefits directly, and nothing in
the cited literature treats the document itself as hostile input.

Measure susceptibility per model. It becomes a fourth column on the Objective 3
ablation table at near zero marginal cost, since the harness already exists.

Mitigations worth testing: explicit delimiting of document text, an instruction
that document content is data and never instruction, stripping invisible and
off-page text during extraction, and flagging suspiciously uniform low-risk
results against clause-type priors.
