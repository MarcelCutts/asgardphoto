#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
#
# Installs npm dependencies and wires Playwright to the Chromium that ships in the
# cloud VM, so `npm run lint`, `npm run build` and `npx playwright test` work as
# soon as a session starts. Exits immediately on a local machine:
# CLAUDE_CODE_REMOTE is only "true" inside a cloud session VM.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# `npm install` rather than `npm ci`: it is a no-op when node_modules already
# matches the lockfile, so a restored or cached VM starts in a couple of seconds.
npm install --no-audit --no-fund --loglevel=error

# The cloud VM has one pre-installed Chromium (and no Firefox/WebKit) under
# PLAYWRIGHT_BROWSERS_PATH, and its revision does not necessarily match the
# one this project's Playwright version expects. Downloading browsers is blocked
# there, so point Playwright at the existing binary instead. playwright.config.ts
# reads this variable; CLAUDE_ENV_FILE makes it visible to later Bash commands.
chromium="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}/chromium"
if [ -x "$chromium" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=\"$chromium\"" >> "$CLAUDE_ENV_FILE"
  echo "session-start: dependencies installed; Playwright will use $chromium (chromium projects only, no Firefox in this VM)."
else
  echo "session-start: dependencies installed; no pre-installed Chromium found, Playwright tests need \`npx playwright install chromium\`."
fi
