#!/bin/sh
# Vercel's build command (see vercel.json). Exists because
# `npx convex deploy --cmd-url-env-var-name X --cmd 'npm run build'` -- the
# pattern Convex's own docs show -- runs the --cmd build BEFORE convex
# deploy's push/codegen completes, not after, on Vercel's build machines.
# Confirmed empirically (not from the docs, which say the opposite): three
# real PR preview builds and one production rebuild all failed with
# "Module not found: Can't resolve '@/convex/_generated/api'" the moment
# the standalone `npx convex codegen` step that used to precede it was
# removed, even though push itself always succeeded. convex/_generated is
# gitignored by design (regenerated per build), so Next.js has nothing to
# import from until codegen has actually run.
#
# Fix: run the push to completion first, parse the deployment URL out of
# its own stdout (no flag gives it to us without --cmd), export it, THEN
# build. `npx convex deploy` alone (no --cmd) was verified locally to
# regenerate convex/_generated correctly against a brand-new Preview
# Deploy Key deployment, a no-diff redeploy, and the persistent production
# deployment alike.
LOG=$(mktemp)
npx convex deploy >"$LOG" 2>&1
STATUS=$?
cat "$LOG"
if [ "$STATUS" -ne 0 ]; then
  rm -f "$LOG"
  exit "$STATUS"
fi

CONVEX_URL=$(grep -oE 'https://[a-z0-9-]+\.[a-z0-9.-]+\.convex\.cloud' "$LOG" | tail -1)
rm -f "$LOG"
if [ -z "$CONVEX_URL" ]; then
  echo "vercel-build.sh: could not find the deployment URL in convex deploy's output" >&2
  exit 1
fi

export NEXT_PUBLIC_CONVEX_URL="$CONVEX_URL"
export NEXT_PUBLIC_CONVEX_SITE_URL="${CONVEX_URL%.convex.cloud}.convex.site"
echo "vercel-build.sh: NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL"

npm run build
