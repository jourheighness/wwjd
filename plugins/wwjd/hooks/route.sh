#!/usr/bin/env bash
# UserPromptSubmit: point UI-shaped prompts at the wwjd skill, once per session.
# Silent for everything else. Extra words: WWJD_ROUTE_WORDS="knapp|sida|färg".
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
sid=$(printf '%s' "$input" | jq -r '.session_id // "none"' 2>/dev/null)
marker_dir="${TMPDIR:-/tmp}/wwjd-route"
[ -e "$marker_dir/$sid" ] && exit 0

# Strong: UI on its own. Weak nouns only count next to a design word.
strong='ui|ux|(chat|assistant|copilot|agent) (panel|ui|interface|window|sidebar|view)|redesign|layouts?|mock-?ups?|wireframes?|figma|storybook|landing ?page|hero|dashboard|css|tailwind|styling|typography|fonts?|colou?r ?palette|contrast|dark mode|light mode|animations?|hover|tooltips?|modal|drawer|sidebar|navbar|buttons?|cards?|components?|design system|design\.md|onboarding|empty state|ui copy|microcopy|a11y|accessibility'
weak='page|screen|view|form|table|menu|header|footer|input|labels?|copy|charts?|list|panel|chat|checkout|article|docs'
verb='design|redesign|make it|looks?|align|aligned|spacing|padding|polish|prettier|cleaner|clean ?up|busy|cluttered|messy|ugly|nicer|simplify|style|restyle|tidy|centered|centred|wrap|jumps?|responsive|mobile'
extra="${WWJD_ROUTE_WORDS:-}"
b='(^|[^\\p{L}\\p{N}_])'; e='($|[^\\p{L}\\p{N}_])'
if printf '%s' "$input" | jq -e --arg s "$strong${extra:+|$extra}" --arg w "$weak" --arg v "$verb" --arg b "$b" --arg e "$e" '
  (.prompt // "") as $p
  | ($p | test($b + "(" + $s + ")" + $e; "i"))
    or (($p | test($b + "(" + $w + ")" + $e; "i")) and ($p | test($b + "(" + $v + ")" + $e; "i")))
    or ($p | test("\\[Image #[0-9]+\\]"))' >/dev/null 2>&1; then
  mkdir -p "$marker_dir" && touch "$marker_dir/$sid"
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"This prompt looks like UI or UX work. The wwjd skill holds the design rules and workflow for it; load it before designing, editing or reviewing UI."}}'
fi
exit 0
