# Versioned prompts

**Owner:** Salinas

Prompts live here as files, never as inline template strings.

Every prompt file carries a version, and that version is written to
scoring_runs.prompt_version on each run. Without this, Objectives 3 and 4 cannot
distinguish a model or grounding effect from a prompt edit, which quietly
invalidates both studies.

Framing note: ask for clause type identification and deviation from standard
terms. Do not ask for a legal opinion. Models decline legal advice, and a high
refusal rate is a self-inflicted result.

Document text is data, never instruction. Delimit it explicitly.
