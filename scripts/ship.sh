#!/bin/bash
# ship.sh "commit message" — build, commit, push, watch deploy, verify live.
set -e
MSG="${1:-iterate}"
npx vite build >/dev/null 2>&1
git add -A
git commit -q -m "$MSG

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" || { echo "nothing to commit"; exit 0; }
git push -q
sleep 12
RUN_ID=$(gh run list --repo juliabenable/benable-brand-prototype-v43 --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --repo juliabenable/benable-brand-prototype-v43 --exit-status --interval 10 2>&1 | tail -1
curl -s -o /dev/null -w "live:%{http_code}\n" "https://juliabenable.github.io/benable-brand-prototype-v43/"
