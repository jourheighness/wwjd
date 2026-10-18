#!/usr/bin/env bash
# SessionStart: hand the plugin's dials to Bash, where wwjd's scripts run.
# Plugin options reach hooks only, so they go through CLAUDE_ENV_FILE. Silent: nothing enters the context.
[ -n "$CLAUDE_ENV_FILE" ] || exit 0
dials=""
for k in creativity budget density motion voice strictness; do
  v=$(printenv "CLAUDE_PLUGIN_OPTION_$(printf '%s' "$k" | tr '[:lower:]' '[:upper:]')")
  [[ "$v" =~ ^[a-z0-9]+$ ]] && dials="$dials $k=$v"
done
# The dials pane (hooks/dials.tsx) keeps WWJD_DIALS current mid-session; this is the fallback.
[ -n "$dials" ] && printf 'export WWJD_DIALS="${WWJD_DIALS-%s}"\n' "${dials# }" >> "$CLAUDE_ENV_FILE"
exit 0
