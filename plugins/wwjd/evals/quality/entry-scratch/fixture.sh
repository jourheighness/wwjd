#!/usr/bin/env bash
set -e
printf '# Salon\n' > README.md
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
