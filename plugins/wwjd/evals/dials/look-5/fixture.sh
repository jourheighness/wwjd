#!/usr/bin/env bash
# Dial creativity at 5; everything else default.
set -e
echo '{ "dials": { "creativity": 5 } }' > .wwjd.json
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
