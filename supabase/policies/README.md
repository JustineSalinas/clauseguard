# RLS policies and guard triggers

**Owner:** Zallen  
**Task:** T4

Postgres RLS is the security boundary for this project. Two rules, both taken
from bugs already shipped in prior projects by this team.

1. RLS enabled on every table holding user data. No exceptions and no
   "we will add it later" tables. Every policy scopes by the authenticated
   user's organization, resolved server side. Never trust a document id
   supplied by the client.

2. Pair every permissive FOR UPDATE policy with its guard trigger. Column level
   write protection here is enforced by BEFORE UPDATE triggers, not WITH CHECK
   clauses. A permissive policy without its trigger leaves fields writable that
   should not be.

Fields that must never be client writable: risk_level, confidence,
ground_truth_label, and everything on scoring_runs. A user who can edit their
own risk scores invalidates every number in the results chapters.

Storage buckets are private. Access only through short-lived signed URLs issued
server side after an ownership check. A storage URL is a capability; treat a
leaked one as an incident.
