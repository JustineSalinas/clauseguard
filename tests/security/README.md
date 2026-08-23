# Security tests

**Owner:** Zallen  
**Task:** T5

Run in CI as build-breaking tests, not as a manual checklist.

Cross-tenant enumeration: authenticate as user A, enumerate user B's document
and clause ids, attempt every read, update, and delete path including the
storage layer, expect denial on all of them.

This test existing and passing is a Chapter 3 architecture claim rather than an
assertion.
