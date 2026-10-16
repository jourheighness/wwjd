#!/usr/bin/env bash
set -e
mkdir -p src/kit src/pages src/legacy
cat > .wwjd.json <<'JSON'
{ "register": "operate", "golden": ["src/pages/Customers.tsx"], "legacy": ["src/legacy/**"] }
JSON
cat > src/kit/index.tsx <<'TSX'
export function FilterBar(p: { children: React.ReactNode }) { return <div role="toolbar" className="filter-bar">{p.children}</div>; }
export function Select(p: { label: string; value: string; options: string[]; onChange: (v: string) => void }) { return null; }
export function Table(p: { rows: { id: string; cells: string[] }[] }) { return null; }
TSX
cat > src/pages/Customers.tsx <<'TSX'
import { FilterBar, Select, Table } from "../kit";
export function Customers({ rows, tier, setTier }: { rows: { id: string; cells: string[] }[]; tier: string; setTier: (v: string) => void }) {
  return (
    <main>
      <h1>Customers</h1>
      <FilterBar><Select label="Tier" value={tier} options={["All", "Gold", "Silver"]} onChange={setTier} /></FilterBar>
      <Table rows={rows} />
    </main>
  );
}
TSX
cat > src/legacy/OrdersTable.tsx <<'TSX'
export function OrdersTable({ rows }: { rows: { id: string; status: string }[] }) {
  return (
    <div style={{ color: "#333" }}>
      <select><option>All</option></select>
      {rows.map((r) => <div key={r.id} onClick={() => { if (confirm("Are you sure?")) {} }}>{r.id} {r.status}</div>)}
    </div>
  );
}
TSX
cat > src/pages/Orders.tsx <<'TSX'
import { OrdersTable } from "../legacy/OrdersTable";
export function Orders({ rows }: { rows: { id: string; status: string }[] }) {
  return <main><h1>Orders</h1><OrdersTable rows={rows} /></main>;
}
TSX
git init -q && git add -A && git -c user.email=e@e -c user.name=e commit -qm fixture
