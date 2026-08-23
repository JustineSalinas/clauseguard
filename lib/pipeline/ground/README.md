# Grounding stage

**Owner:** Salinas + Navarro  
**Task:** T8

Supplies statutory context to the scoring stage. Three arms, selected by
config, never by a branch in three different files.

    ARM 1  none     ungrounded baseline
    ARM 2  static   clause_type mapped to 2-4 fixed provisions   (Salinas)
    ARM 3  rag      pgvector retrieval over the provision corpus (Navarro)

The arm is recorded as grounding_arm on the scoring run, which is what makes
Objective 4 a query rather than a second codebase.

NoRelevantProvision is a result, not a failure. How often retrieval finds
nothing relevant is itself a finding worth reporting.
