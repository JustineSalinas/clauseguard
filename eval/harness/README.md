# Evaluation harness

**Owner:** Salinas

Runs a corpus under a config and writes one scoring_run plus its clause_scores.

Built on Day 3, before the pipeline is any good. That ordering is the point:
once the harness exists, Objective 3 is a config swap and the adversarial work
is a matter of adding cases.

Record per call: model, prompt_version, grounding_arm, tokens in, tokens out,
latency, outcome. The cost and latency columns Objective 3 requires cannot be
reconstructed retroactively.
