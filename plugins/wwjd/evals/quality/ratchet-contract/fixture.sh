#!/usr/bin/env bash
set -e
mkdir -p src
cat > RATCHET.md <<'MD'
# Ratchet

## Config
- judge: strict
- branch: main

## Scheduler
- nightly 02:00

## Backlog
- [eng] Flaky date test in utils

## Gotchas

## Tells
MD
cat > src/PlanCard.tsx <<'TSX'
export function PlanCard() {
  return (
    <div className="card text-center bg-gradient-to-br from-indigo-500 to-violet-600">
      <p className="uppercase tracking-widest">Most popular</p>
      <h3>Pro</h3>
      <p>Only 3 spots left! Hurry, offer ends in 10 minutes.</p>
      <button onClick={() => { if (confirm("Are you sure?")) {} }}>Buy</button>
    </div>
  );
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
