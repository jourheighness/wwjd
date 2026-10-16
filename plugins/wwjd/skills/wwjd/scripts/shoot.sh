#!/usr/bin/env bash
# shoot: screenshot a URL at desktop and narrow widths, in light and dark.
# Usage: shoot.sh <url> [out-dir] [widths]   (default widths "1440 390")
# Needs Playwright's CLI via npx; run `npx playwright install chromium` once.
# Prints the PNG paths. Read them: a report about a screenshot is not a look.
set -euo pipefail
url="${1:?usage: shoot.sh <url> [out-dir] [widths]}"
out="${2:-./.wwjd-shots}"
widths="${3:-1440 390}"
mkdir -p "$out"
slug=$(printf '%s' "$url" | sed -E 's#^[a-z]+://##; s#[^A-Za-z0-9]+#-#g; s#-+$##' | cut -c1-60)
for w in $widths; do
  h=900; [ "$w" -lt 800 ] && h=844
  for scheme in light dark; do
    f="$out/${slug}-${w}-${scheme}.png"
    npx --yes playwright screenshot --browser chromium --viewport-size "${w},${h}" \
      --color-scheme "$scheme" --wait-for-timeout 800 --full-page "$url" "$f" >/dev/null
    echo "$f"
  done
done
