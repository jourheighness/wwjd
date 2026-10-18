#!/usr/bin/env bash
# Dial budget at 1; everything else default.
set -e
echo '{ "dials": { "budget": 1 } }' > .wwjd.json
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
