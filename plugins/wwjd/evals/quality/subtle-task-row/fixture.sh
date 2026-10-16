#!/usr/bin/env bash
set -e
mkdir -p src
cat > src/TaskRow.tsx <<'TSX'
import { Avatar } from "./kit/Avatar";
import { Menu } from "./kit/Menu";

type Task = { id: string; title: string; owner: { name: string; avatarUrl: string }; updatedAt: string; comments: number; done: number; total: number };

export function TaskRow({ task, onOpen, onDelete }: { task: Task; onOpen: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:px-4 hover:bg-neutral-100">
      <span onClick={onOpen} className="font-medium">{task.title}</span>
      <span className="text-sm text-gray-500">Owner: {task.owner.name}</span>
      <span className="text-sm">Updated {new Date(task.updatedAt).toLocaleString()}</span>
      <span className="text-sm">{task.comments} comments</span>
      <span className="text-sm">{task.done} of {task.total} subtasks</span>
      <button onClick={onOpen}>Learn more</button>
      <button onClick={() => { if (window.confirm("Are you sure you want to delete this task?")) onDelete(); }}>Delete</button>
    </div>
  );
}
TSX
mkdir -p src/kit
echo 'export function Avatar(p: { src: string; name: string; size?: "sm" | "md" }) { return <img src={p.src} alt={p.name} width={24} height={24} />; }' > src/kit/Avatar.tsx
echo 'export function Menu(p: { items: { label: string; onSelect: () => void; danger?: boolean }[] }) { return null; }' > src/kit/Menu.tsx
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
