#!/usr/bin/env bash
# Dial motion at 5; everything else default.
set -e
echo '{ "dials": { "motion": 5 } }' > .wwjd.json
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
