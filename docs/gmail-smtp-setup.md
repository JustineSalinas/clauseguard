# Gmail SMTP Setup Plan

## Goal
Send email (verification/reset, or transactional) through Gmail's SMTP
server, either as Supabase Auth's custom SMTP provider or via Nodemailer in
a server-side route/action.

## 1. Enable 2-Step Verification
Gmail SMTP requires an **App Password**, which only works if 2FA is on.
- Go to https://myaccount.google.com/security
- Turn on **2-Step Verification** if it isn't already on

## 2. Generate an App Password
- Go to https://myaccount.google.com/apppasswords
- Under "App name," enter something identifiable (e.g. `clauseguard-smtp`)
- Click **Create** — Google returns a 16-character password
- Copy it with no spaces; this is the SMTP password, **not** the normal
  Gmail account password

## 3. SMTP connection settings
```
Host:     smtp.gmail.com
Port:     587 (STARTTLS) or 465 (SSL/TLS)
Username: your_full_email@gmail.com
Password: <16-char app password>
```

## 4. Integration options

### Option A — Supabase Auth custom SMTP
Use this to replace Supabase's default (rate-limited) email sender for
verification/reset emails.
- Supabase Dashboard → Authentication → Settings → SMTP Settings
- Enter host/port/username/app-password from step 3
- Save and send a test signup/reset to confirm delivery

### Option B — Nodemailer in a server route/action
Use this for transactional email outside Supabase Auth (e.g. contact form,
custom notifications).

```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: "recipient@example.com",
  subject: "Hello",
  text: "Body text",
});
```

- Store `GMAIL_USER` / `GMAIL_APP_PASSWORD` in `.env.local`
- Never prefix these with `NEXT_PUBLIC_` — this is server-side only, same
  rule as the Supabase service role key

## 5. Verify
- [ ] 2FA enabled on the Gmail account
- [ ] App password generated and stored in `.env.local` (not committed)
- [ ] Test email sent and received via chosen integration path
- [ ] Confirm daily send volume is within Gmail's SMTP limits (see below)

## Caveats
- Gmail SMTP caps at ~500 emails/day (2,000/day for Google Workspace) —
  fine for dev/low volume, not production transactional email at scale
- For production-grade deliverability later, consider Resend or Postmark
