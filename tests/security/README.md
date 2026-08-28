# Security tests

**Owner:** Zallen
**Task:** T5

You own proving the security holds. Salinas writes the RLS policies; you attack
them. Nobody on a three-person team should both write and clear the same
control, so this separation is deliberate rather than a matter of experience.

## Running them

```bash
npm run test:security
```

If the accounts are not configured the suite prints what is missing and skips
rather than failing. That is not a pass. It means nothing was checked.

## What you need first

Two verified accounts, and at least one document uploaded by user A. Add to
`.env.local` (never commit it):

```
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

The suite signs in with the publishable key only. Never point it at the secret
key: that key bypasses RLS, so a test using it would pass no matter how broken
the policies are.

## What a failure means

Every test here fails only when something is genuinely wrong. There are no
flaky ones. If one goes red, stop and tell Salinas before writing anything
else. A cross-tenant read is not a bug to file, it is a stop-the-line event.

The one to care about most is `user B cannot read user A's document by guessing
its id`. That is the exact bug a prior project by this team shipped:
authenticated users could reach any tenant's data because the rules layer only
checked that someone was logged in.

## How to add a test

Copy the shape of an existing one. The pattern is always the same:

1. Sign in as the wrong user.
2. Try to do the thing.
3. Assert nothing came back, or that the row is unchanged.

When a new table is added to the schema, add it to `OWNED_TABLES` in
`helpers.mjs`. That is usually the only change needed.

A note on how RLS behaves: a denied read returns an **empty result, not an
error**. So checking `error === null` plus `rows.length === 0` is the correct
pass condition. A test that only checks for an error will pass against
completely broken policies.

## Your logbook

Keep `findings.md` in this folder. One entry per run:

```
## 2026-08-26 - run against staging
- All 11 tests passed.
- Note: no clauses in the DB yet, so the results-not-writable test skipped.
```

That log is Chapter 3 evidence and the raw material for the Limitations
chapter. "We ran an adversarial isolation suite in CI and it passed on every
build" is a claim you can defend. "We used RLS" is not.
