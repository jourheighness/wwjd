#!/usr/bin/env bash
# PostToolUse: one node process per UI edit: note it for the Strictness gate, then lint it with wwjd.mjs check --new.
# Reports errors plus warnings that are new against .wwjd-baseline.json (errors only without one),
# at most 5 lines, as context for the agent. Silent for clean files, non-UI files and missing node.
# Lint off for one project: WWJD_HOOK_CHECK=0 (the gate's note still happens).
input=$(cat)
# Non-UI paths leave before node starts: most edits are not UI files.
re='"file_path"[[:space:]]*:[[:space:]]*"([^"]*)"'
[[ $input =~ $re ]] || exit 0
case "${BASH_REMATCH[1]}" in
  *.tsx|*.jsx|*.vue|*.svelte|*.astro|*.html|*.mdx|*.css|*.scss) ;;
  *\\*) ;; # a JSON escape in the path: let node parse it
  *) exit 0 ;;
esac
command -v node >/dev/null 2>&1 || exit 0
printf '%s' "$input" | node "${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}/skills/ux/scripts/wwjd.mjs" check --hook 2>/dev/null || exit 0
