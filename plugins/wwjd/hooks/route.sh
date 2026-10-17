#!/usr/bin/env bash
# UserPromptSubmit: point UI-shaped prompts at the wwjd skill, once per session.
# Silent for everything else. Extra words: WWJD_ROUTE_WORDS="banner|carousel|badge".
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
sid=$(printf '%s' "$input" | jq -r '.session_id // "none"' 2>/dev/null)
marker_dir="${TMPDIR:-/tmp}/wwjd-route"
seen=0; [ -e "$marker_dir/$sid" ] && seen=1
prompt=$(printf '%s' "$input" | jq -r '.prompt // ""' 2>/dev/null)

# Per-request dial nudges (every prompt of a UI session; one stop, this request only).
nudge=""
nud() { printf '%s' "$prompt" | grep -Eiq "(^|[^[:alnum:]_])($1)([^[:alnum:]_]|$)" && nudge="$nudge $2;"; }
nud 'bolder|wilder|more creative|more daring|surprise me|more personality' 'creativity +1'
nud 'safer|tamer|more conservative|more standard|less flashy' 'creativity -1'
nud 'leaner|less busy|less cluttered|strip (it )?down|fewer things' 'budget -1'
nud 'show more|more detail|more info(rmation)?|richer' 'budget +1'
nud 'denser|more compact|tighter' 'density +1'
nud 'airier|roomier|more breathing room|more space' 'density -1'
nud 'warmer|friendlier|more human' 'voice +1'
nud 'terser|drier|less chatty|less wordy' 'voice -1'
nud 'quick|quickly|rough|just ship' 'rigor -1'
nud 'thorough|carefully|polish(ed)?|pixel.perfect' 'rigor +1'
nudge_text=""; [ -n "$nudge" ] && nudge_text=" Dial nudge for this request only:${nudge%;} (references/dials.md)."
if [ "$seen" = 1 ]; then
  [ -n "$nudge_text" ] && jq -cn --arg c "wwjd:${nudge_text}" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $c}}'
  exit 0
fi

# Strong: UI on its own. Weak nouns only count next to a design word.
strong='ui|ux|(chat|assistant|copilot|agent) (panel|ui|interface|window|sidebar|view)|redesign|layouts?|mock-?ups?|wireframes?|figma|storybook|landing ?page|hero|dashboard|css|tailwind|styling|typography|fonts?|colou?r ?palette|contrast|dark mode|light mode|animations?|hover|tooltips?|modal|drawer|sidebar|navbar|buttons?|cards?|components?|design system|design\.md|onboarding|empty state|ui copy|microcopy|a11y|accessibility'
weak='page|screen|view|form|table|menu|header|footer|input|labels?|copy|charts?|list|panel|chat|checkout|article|docs|blog|templates?|settings|pricing|navigation'
verb='design|redesign|bolder|safer|leaner|richer|denser|airier|roomier|warmer|terser|make it|looks?|align|aligned|spacing|padding|polish|prettier|cleaner|clean ?up|busy|cluttered|messy|ugly|nicer|simplify|style|restyle|tidy|centered|centred|wrap|jumps?|responsive|mobile|reads? well|readab(le|ility)|hard to (use|read|find|navigate)'
# Companion skills, named in the nudge when their words appear.
look='palette|colou?rs?|fonts?|typeface|typography|theme|brand(ing)?|moodboard|dark mode|light mode|look and feel'
motion='animat[a-z]*|motion|transitions?|micro-?interactions?|smoother|snappier|feel alive'
extra="${WWJD_ROUTE_WORDS:-}"
b='(^|[^\p{L}\p{N}_])'; e='($|[^\p{L}\p{N}_])'
if printf '%s' "$input" | jq -e --arg s "$strong${extra:+|$extra}" --arg w "$weak" --arg v "$verb" --arg b "$b" --arg e "$e" '
  (.prompt // "") as $p
  | ($p | test($b + "(" + $s + ")" + $e; "i"))
    or (($p | test($b + "(" + $w + ")" + $e; "i")) and ($p | test($b + "(" + $v + ")" + $e; "i")))
    or ($p | test("\\[Image #[0-9]+\\]"))' >/dev/null 2>&1; then
  mkdir -p "$marker_dir" && touch "$marker_dir/$sid"
  also=$(printf '%s' "$input" | jq -r --arg l "$look" --arg m "$motion" --arg b "$b" --arg e "$e" '
    (.prompt // "") as $p
    | [ (if ($p | test($b + "(" + $l + ")" + $e; "i")) then "wwjd-look for the look" else empty end),
        (if ($p | test($b + "(" + $m + ")" + $e; "i")) then "wwjd-animation for motion" else empty end) ]
    | if length > 0 then " Also load " + join(" and ") + "." else "" end' 2>/dev/null)
  # Effective dials (plugin options reach hooks as CLAUDE_PLUGIN_OPTION_*; .wwjd.json overrides per project).
  dl=""; for k in creativity budget density motion voice rigor decider; do
    v=$(printenv "CLAUDE_PLUGIN_OPTION_$(printf '%s' "$k" | tr '[:lower:]' '[:upper:]')"); [[ "$v" =~ ^[a-z0-9]+$ ]] && dl="$dl $k=$v"; done
  dline=$(WWJD_DIALS="${dl# }" node "${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/skills/wwjd/scripts/wwjd.mjs" dials 2>/dev/null)
  case "$dline" in ""|"dials: all default") dline="" ;; *) dline=" $dline" ;; esac
  jq -cn --arg c "This prompt looks like UI or UX work. Load the wwjd skill before designing, editing or reviewing UI; it routes to its rules and commands.$also$dline$nudge_text" \
    '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $c}}'
fi
exit 0
