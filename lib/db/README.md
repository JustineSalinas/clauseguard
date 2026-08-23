# Database access

**Owner:** Salinas  
**Task:** T1

Typed access to the evaluation schema. See supabase/migrations for the schema
itself and PLAN.md section 1.1 for why it is shaped this way.

Reminder: the API layer is not the security boundary. Assume any operation RLS
permits is reachable directly, because in a prior project by this team it was.
