#!/usr/bin/env bash
# SessionStart: hand the plugin's dials (and the optional decider key) to Bash, where wwjd's scripts run.
# Plugin options reach hooks only, so they go through CLAUDE_ENV_FILE. Silent: nothing enters the context.
[ -n "$CLAUDE_ENV_FILE" ] || exit 0
dials=""
for k in creativity budget density motion voice rigor decider; do
  v=$(printenv "CLAUDE_PLUGIN_OPTION_$(printf '%s' "$k" | tr '[:lower:]' '[:upper:]')")
  [[ "$v" =~ ^[a-z0-9]+$ ]] && dials="$dials $k=$v"
done
[ -n "$dials" ] && printf 'export WWJD_DIALS=%q\n' "${dials# }" >> "$CLAUDE_ENV_FILE"
[ -n "$CLAUDE_PLUGIN_OPTION_DECIDER_KEY" ] && printf 'export WWJD_DECIDER_KEY=%q\n' "$CLAUDE_PLUGIN_OPTION_DECIDER_KEY" >> "$CLAUDE_ENV_FILE"
exit 0
