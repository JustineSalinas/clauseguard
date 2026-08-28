# Security audit checklist

**Owner:** Zallen

Work through this before each of the three checkpoints: after the schema is
applied (Day 1), before the usability sessions (Day 11), and before the deploy
freeze (Day 14). Record the date and result of each pass in `findings.md`.

Most items are a single command or a single look. None require writing code.

---

## 1. Row Level Security

- [ ] Every table in `public` has RLS **enabled**. Supabase's dashboard shows a
      warning on any table without it.
- [ ] Every policy names a role with `TO authenticated`, not `auth.role() =
      'authenticated'`. The second form is deprecated and passes for anonymous
      users when anonymous sign-in is on.
- [ ] Every policy carries an ownership check as well as the role check.
      `TO authenticated` alone means *any* signed-in person, which is
      authentication without authorization.
- [ ] `ground_truth_labels` has RLS on and **no policy**, so it returns nothing
      to a browser session. It is the answer key.
- [ ] No table has an `UPDATE` policy for `authenticated`. If one appears,
      check it has both `USING` and `WITH CHECK`, or ownership can be
      reassigned.

**How to check:** Supabase dashboard, Authentication, Policies. Compare against
`supabase/migrations/0001_init.sql`.

---

## 2. Storage

- [ ] The `contracts` bucket is **private**, not public. A public bucket here
      is a total compromise reachable by guessing a URL.
- [ ] Objects are stored under `{owner_id}/{document_id}/{filename}`.
- [ ] Signed URLs have a short expiry. Anything over an hour needs a reason.
- [ ] No signed URL appears in a log, a commit, or client-side state.

**Try this:** copy a signed URL for one of user A's contracts, open it in a
private window while signed in as user B. It should still work while the
signature is valid, which is exactly why the expiry must be short. Then wait
for it to expire and confirm it stops working.

---

## 3. Keys and environment

- [ ] `.env.local` is not committed. Run `git ls-files | grep env` and expect
      only `.env.example`.
- [ ] No variable holding a secret starts with `NEXT_PUBLIC_`. Anything with
      that prefix is shipped to the browser.
- [ ] The Supabase **secret / service_role** key appears nowhere in `app/`,
      `components/`, or `lib/`. Search for `service_role` across the repo.
- [ ] Model provider keys are server-side only.

**How to check:**
```bash
git ls-files | grep -i env
grep -rn "service_role" app components lib 2>/dev/null
grep -rn "NEXT_PUBLIC" .env.example
```

---

## 4. Auth behaviour

- [ ] Signing out actually clears the session. Sign out, press back, confirm
      `/dashboard` redirects to `/login`.
- [ ] A signed-out visitor hitting `/dashboard` lands on `/login`, not an
      error page.
- [ ] A wrong password and an unregistered email produce the **same** message.
      Different messages would let anyone discover who has an account.
- [ ] A password reset link works once and then stops working.
- [ ] An expired confirmation link lands on the error page, not a crash.

---

## 5. Prompt injection

This is your research contribution, not just a check.

- [ ] Every contract in `eval/adversarial/` opens normally and looks innocent
      to a human reader.
- [ ] The hidden text is genuinely invisible: 1pt, white on white, or outside
      the page margins.
- [ ] Extraction strips it. Check `extractions.suppressed_token_count` is
      greater than zero for those documents.
- [ ] With suppression deliberately off, record what each model does. That
      table is the result.
- [ ] At least one payload is written in Filipino. English-only safety training
      is a plausible gap and nobody has reported it for this task.

---

## 6. Before the deploy freeze

- [ ] The full security suite passes on the deployed environment, not only
      locally.
- [ ] The demo runs end to end with the network disabled.
- [ ] No real client contract is in the demo corpus. Synthetic or consented
      only, and never on a projector.
- [ ] `findings.md` is up to date, because it is Chapter 3 evidence.

---

## When something fails

Stop and tell Salinas before doing anything else. Do not attempt a fix on a
security finding yourself, and do not push a change to `supabase/` — that is
deliberately outside your remit so that the person who wrote a control is never
the person who signs it off.

Write it up like this:

```
## Finding: user B could read user A's clauses
Date: 2026-08-26
Severity: critical
How I found it: npm run test:security, third test failed
What I saw: 4 rows returned that belong to user A
Status: reported to Salinas 09:40, fix pending
```
