#!/usr/bin/env bash
set -e
git init -q && git -c user.email=e@e -c user.name=e commit -q --allow-empty -m fixture
