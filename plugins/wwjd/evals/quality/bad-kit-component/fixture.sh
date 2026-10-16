#!/usr/bin/env bash
set -e
mkdir -p src/kit src/pages
cat > src/kit/Row.tsx <<'TSX'
export function Row({ title, meta, onOpen }: { title: string; meta: string; onOpen: () => void }) {
  return (
    <div className="row" onClick={onOpen}>
      <span className="truncate font-medium">{title}</span>
      <span className="meta">{meta}</span>
    </div>
  );
}
TSX
cat > src/kit/Row.stories.tsx <<'TSX'
import { Row } from "./Row";
export default { title: "Kit/Row", component: Row };
export const Default = { args: { title: "Quarterly report", meta: "2h", onOpen: () => {} } };
TSX
cat > src/pages/Inbox.tsx <<'TSX'
import { Row } from "../kit/Row";
export function Inbox({ items, open }: { items: { id: string; title: string; age: string }[]; open: (id: string) => void }) {
  return <main><h1>Inbox</h1>{items.map((i) => <Row key={i.id} title={i.title} meta={i.age} onOpen={() => open(i.id)} />)}</main>;
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
