#!/usr/bin/env bash
set -e
mkdir -p src
cat > src/ProjectCard.tsx <<'TSX'
export function ProjectCard({ name, done, total }: { name: string; done: number; total: number }) {
  return (
    <div className="rounded-lg border p-4 text-center shadow-lg bg-gradient-to-r from-indigo-500 to-violet-500">
      <p className="uppercase tracking-widest text-xs">Overview</p>
      <h3>{name}</h3>
      <p>This card shows your project progress. Don't worry, nothing is ever lost!</p>
      <span>{done} of {total} tasks done</span>
      <div>
        <button>Edit</button><button>Share</button><button>Duplicate</button><button>Archive</button><button onClick={() => { if (confirm("Are you sure?")) {} }}>Delete</button>
      </div>
    </div>
  );
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
