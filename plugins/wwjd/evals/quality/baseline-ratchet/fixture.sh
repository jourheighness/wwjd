#!/usr/bin/env bash
set -e
mkdir -p src
cat > src/Promo.tsx <<'TSX'
export function Promo() {
  return (
    <section className="bg-gradient-to-r from-orange-400 to-rose-500">
      <h2>Spring menu</h2>
      <a href="#">See the menu</a>
    </section>
  );
}
TSX
cat > .wwjd-baseline.json <<'JSON'
{
  "version": 1,
  "total": 2,
  "files": {
    "src/Promo.tsx": {
      "gradient <section className=\"bg-gradient-to-r from-orange-400 to-rose-500\">": 1,
      "raw-palette <section className=\"bg-gradient-to-r from-orange-400 to-rose-500\">": 1
    }
  }
}
JSON
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
