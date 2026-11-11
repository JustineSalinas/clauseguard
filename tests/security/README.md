# tests/security

**Owner:** Zallen runs/extends/logs this suite — Navarro wrote its predecessor
(the deleted Supabase-era suite) and this Convex-native rebuild follows the
same split. If anything here goes red, stop and tell Salinas; don't patch
`convex/` access checks yourself (see root `CLAUDE.md`, "Team and ownership").

## What this tests

Real cross-tenant access checks against the **live** Convex deployment named
in `.env.local`'s `NEXT_PUBLIC_CONVEX_URL` — never a mock database. Convex has
no RLS backstop; every ownership check in `convex/*.ts` is a handwritten
`getAuthUserId(ctx)` plus `doc.ownerId === userId` comparison, and the only
way to catch a missing or wrong one is to actually attempt the cross-tenant
read/write as a second real signed-in user and see what comes back.

Two authenticated test accounts (`clauseguard-sectest-a@example.com` /
`-b@...`) are created automatically on first run via Convex Auth's password
`signUp` flow and reused on every later run — no manual account provisioning,
no `TEST_USER_*` env vars needed (the old Supabase suite needed those; this
one doesn't).

## Running it

```bash
npm run test:security
```

Needs `NEXT_PUBLIC_CONVEX_URL` in `.env.local` pointing at a real Convex
deployment (dev or prod) — it will actually sign in, create a real document,
and attempt real cross-tenant reads/writes against whatever deployment that
points at.

## Files

- `helpers.mjs` — `makeTestClient(which)` signs in/up a real account and
  returns an authenticated `ConvexHttpClient`; `createOwnedDocument(client)`
  uploads a real fixture through the actual upload path
  (`generateUploadUrl` → `PUT` → `documents.create`), not a direct
  `db.insert`, so the ownership-assignment path itself is exercised too.
  `OWNED_TABLES` is the checklist: every table holding one user's private
  data. **When a table holding user data is added to the schema, add it
  here and add its read path to `cross-tenant.test.mjs`.**
- `cross-tenant.test.mjs` — the actual cross-tenant checks: one account
  attempts to read/list/delete another account's document, clauses, scores,
  and stage runs. Queries must return `null`/`[]` (never an error — a wrong
  id must not be distinguishable from someone else's real id); mutations
  that attempt a real write on someone else's row must throw.
- `no-public-surface.test.mjs` — a structural check, not a network one:
  `groundTruthLabels` (the annotated dataset's answer key) must have zero
  Convex functions anywhere referencing it. Stronger than "returns empty" —
  there's no function to call at all.

## Deliberately out of scope

`provisions` / `provisionMappings` (the statutory corpus) are intentionally
public and readable by any signed-in user — they're not tested here because
leaking them isn't a leak, it's the product working as designed.
