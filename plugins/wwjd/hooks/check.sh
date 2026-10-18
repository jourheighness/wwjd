#!/usr/bin/env bash
# PostToolUse: lint the UI file just edited with wwjd.mjs check --new.
# Reports errors plus warnings that are new against .wwjd-baseline.json (errors only without one),
# at most 5 lines, as context for the agent. Silent for clean files, non-UI files and missing node.
# Off for one project: WWJD_HOOK_CHECK=0.
[ "${WWJD_HOOK_CHECK:-1}" = "0" ] && exit 0
command -v node >/dev/null 2>&1 || exit 0
node "${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}/skills/ux/scripts/wwjd.mjs" check --hook 2>/dev/null || exit 0
