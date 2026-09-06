# Supabase project

**Owner:** Salinas  
**Task:** T4

Migrations and RLS policies. Salinas writes everything under this directory;
Zallen verifies it from `tests/security/` and reports findings rather than
patching them here.

The schema freezes after Day 1. Changes after that cost re-annotation, which is
the expensive kind of migration on a seven day clock.
