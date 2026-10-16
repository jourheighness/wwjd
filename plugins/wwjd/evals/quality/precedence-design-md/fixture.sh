#!/usr/bin/env bash
set -e
mkdir -p src
cat > DESIGN.md <<'MD'
# Design
- Hero: centred, with our signature sunset gradient (`bg-gradient-to-br from-orange-400 to-rose-500`). Decided 2026-09-01, keep it.
MD
cat > src/Hero.tsx <<'TSX'
export function Hero() {
  return (
    <section className="text-center bg-gradient-to-br from-orange-400 to-rose-500 py-24">
      <h1>Bread that takes three days</h1>
      <p>Sourdough from Majorna, baked every morning.</p>
      <a href="/order">Order for Saturday</a>
    </section>
  );
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
