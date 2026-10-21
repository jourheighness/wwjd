import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const BOARD = join(dirname(fileURLToPath(import.meta.url)), "board.mjs");

function project() {
  const root = mkdtempSync(join(tmpdir(), "wwjd-board-"));
  writeFileSync(join(root, ".wwjd.json"), JSON.stringify({ title: "Toolshed" }));
  mkdirSync(join(root, ".wwjd"));
  const log = (entries) => writeFileSync(join(root, ".wwjd", "decisions.jsonl"), entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
  const run = (...args) => JSON.parse(execFileSync("node", [BOARD, ...args], { cwd: root, encoding: "utf8" }));
  const docs = (r) => r.batches.flat().map((w) => ({ ...w, data: JSON.parse(readFileSync(w.file_path, "utf8")) }));
  return { root, log, run, docs };
}

test("page: the kit titled after the project, so boards differ in the gallery", () => {
  const p = project();
  const out = execFileSync("node", [BOARD, "page", "--title", "Toolshed"], { cwd: p.root, encoding: "utf8" }).trim();
  assert.match(readFileSync(out, "utf8"), /<title>Toolshed board<\/title>/);
});

test("round: creates only, never changes a document; settled decisions and replaced shots are new documents", () => {
  const p = project();
  p.log([{ id: "d1", at: "2026-10-21T10:00:00Z", surface: "Hero", kind: "choice", text: "Cut the stats row" }]);
  writeFileSync(join(p.root, ".wwjd", "directions.json"), JSON.stringify([{ name: "A · Catalogue", url: "https://claude.ai/artifact/X" }]));
  const r1 = p.run("round", "--title", "Landing page", "--check", "Look at it on desktop and phone=done", "--check", "Get a second opinion=not run: not owed",
    "--shot", "/x/landing-1440-light.png=/_blob/aaa");
  const d1 = p.docs(r1);
  assert.ok(d1.every((w) => w.op === "set" && !("if_version" in w)));
  assert.deepEqual(d1.map((w) => w.collection).sort(), ["decisions", "directions", "handovers", "meta", "shots"]);
  assert.deepEqual(d1.find((w) => w.collection === "handovers").data.checks[1], { label: "Get a second opinion", status: "not run", note: "not owed" });
  assert.equal(d1.find((w) => w.collection === "meta").data.title, "Toolshed");
  assert.deepEqual(r1.deleteAssets, []);

  p.log([{ id: "d1", at: "2026-10-21T10:00:00Z", surface: "Hero", kind: "choice", text: "Cut the stats row", kept: true },
    { id: "d2", at: "2026-10-21T11:00:00Z", surface: "Hero", kind: "assumption", text: "Members are local" }]);
  const r2 = p.run("round", "--title", "Hero tweaks", "--shot", "/x/landing-1440-light.png=/_blob/bbb");
  const d2 = p.docs(r2);
  assert.deepEqual(d2.map((w) => `${w.collection}/${w.doc_id}`).sort(), ["decisions/d2", "handovers/r002", "settled/d1-r002", "shots/r002-landing-1440-light"]);
  assert.equal(d2.find((w) => w.collection === "settled").data.status, "dismissed");
  assert.deepEqual(r2.deleteAssets, ["aaa"]);

  // --again redoes the last round from the state before it
  const again = p.docs(p.run("round", "--again", "--title", "Hero tweaks", "--shot", "/x/landing-1440-light.png=/_blob/bbb"));
  assert.deepEqual(again.map((w) => w.doc_id).sort(), d2.map((w) => w.doc_id).sort());
});
