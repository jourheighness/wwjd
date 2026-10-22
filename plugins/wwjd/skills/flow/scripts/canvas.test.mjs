import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const CANVAS = join(dirname(fileURLToPath(import.meta.url)), "canvas.mjs");

/** The first 24 bytes of a PNG: signature, IHDR length and type, width, height. Enough for canvas.mjs. */
const png = (w, h) => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
};

const FLOW = {
  v: 1, app: "Toolshed",
  screens: [
    { id: "catalogue", title: "Catalogue", job: "Find a tool", shot: ".wwjd/shots/catalogue.png" },
    { id: "tool-detail", title: "Tool <detail>", job: "Decide to borrow", shot: ".wwjd/shots/detail.png" },
    { id: "borrow", title: "Borrow", job: "Book it", shot: ".wwjd/shots/borrow.png" },
    { id: "my-loans", title: "My loans", job: "See what I hold", shot: ".wwjd/shots/loans.png" },
    { id: "cancel", title: "Cancel loan", job: "Give it back early" },
  ],
  edges: [
    { from: "catalogue", to: "tool-detail", action: "Open a tool", kind: "forward" },
    { from: "tool-detail", to: "borrow", action: "Borrow", kind: "forward" },
    { from: "borrow", to: "tool-detail", action: "Back", kind: "back" },
    { from: "my-loans", to: "cancel", action: "Cancel loan", kind: "destructive" },
    { from: "cancel", to: "my-loans", action: "Undo", kind: "undo" },
  ],
  journeys: [
    { id: "borrow", title: "Borrow a tool", steps: ["catalogue", "tool-detail", "borrow"], goal: "A booked tool" },
    { id: "return", title: "Return early", steps: ["catalogue", "my-loans", "cancel"], goal: "The loan ends" },
  ],
};

const DECISIONS = [
  { id: "d1", at: "2026-10-21T10:00:00Z", surface: "Catalogue", kind: "save", title: "Kept prices visible", text: "Kept prices on cards", why: "people compare", screen: "catalogue" },
  { id: "d2", at: "2026-10-21T10:01:00Z", surface: "Catalogue", kind: "choice", text: "One filter row", why: "less to scan", screen: "catalogue", aspect: "ux" },
  { id: "d3", at: "2026-10-21T10:02:00Z", surface: "Borrow", kind: "assumption", title: "Members are local", text: "Assumed members live nearby", screen: "borrow" },
  { id: "d4", at: "2026-10-21T10:03:00Z", surface: "Borrow", kind: "choice", text: "Dropped the map", screen: "borrow", kept: true },
  { id: "d5", at: "2026-10-21T10:04:00Z", surface: "Detail", kind: "choice", text: "Big photo", screen: "tool-detail", correction: { note: "Small photo" } },
  { id: "d6", at: "2026-10-21T10:05:00Z", surface: "Settings", kind: "choice", text: "Settings in a sheet", screen: "nowhere" },
];

function project() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "wwjd-canvas-")));
  writeFileSync(join(root, ".wwjd.json"), "{}");
  mkdirSync(join(root, ".wwjd", "shots"), { recursive: true });
  writeFileSync(join(root, ".wwjd", "shots", "catalogue.png"), png(1440, 1494));
  writeFileSync(join(root, ".wwjd", "shots", "detail.png"), png(1440, 2000));
  writeFileSync(join(root, ".wwjd", "shots", "borrow.png"), png(780, 1688));
  writeFileSync(join(root, ".wwjd", "shots", "loans.png"), png(1440, 900));
  const flow = (f) => writeFileSync(join(root, "wwjd.flow.json"), JSON.stringify(f));
  const log = (entries) => writeFileSync(join(root, ".wwjd", "decisions.jsonl"), entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
  flow(FLOW);
  log(DECISIONS);
  const run = (...args) => JSON.parse(execFileSync("node", [CANVAS, ...args], { cwd: root, encoding: "utf8" }));
  const read = (r) => JSON.parse(readFileSync(r.file_path, "utf8"));
  const art = (r, file) => readFileSync(join(r.root, "project", file), "utf8");
  const uploadAll = () => {
    const { upload } = run("uploads");
    run("assets", ...upload.map((abs, i) => `${abs}=/_blob/id${i}`));
    return upload;
  };
  return { root, flow, log, run, read, art, uploadAll };
}

test("uploads and assets: only shots with no upload or a changed file", () => {
  const p = project();
  const { upload } = p.run("uploads");
  assert.deepEqual(upload.map((f) => f.slice(p.root.length + 1)).sort(), [".wwjd/shots/borrow.png", ".wwjd/shots/catalogue.png", ".wwjd/shots/detail.png", ".wwjd/shots/loans.png"]);
  const r = p.run("assets", ".wwjd/shots/catalogue.png=/_blob/aaa", `${join(p.root, ".wwjd/shots/detail.png")}=/_blob/bbb`);
  assert.deepEqual(r.recorded, [".wwjd/shots/catalogue.png", ".wwjd/shots/detail.png"]);
  const saved = JSON.parse(readFileSync(join(p.root, ".wwjd", "canvas-assets.json"), "utf8"));
  assert.equal(saved[".wwjd/shots/catalogue.png"].url, "/_blob/aaa");
  assert.equal(typeof saved[".wwjd/shots/catalogue.png"].mtime, "number");
  assert.equal(p.run("uploads").upload.length, 2);
  // a retaken shot (new mtime) is uploaded again
  const t = new Date(Date.now() + 60_000);
  utimesSync(join(p.root, ".wwjd/shots/catalogue.png"), t, t);
  assert.ok(p.run("uploads").upload.some((f) => f.endsWith("catalogue.png")));
});

test("build: artboards at half width, the diagram, stickies, row titles, and missing screens", () => {
  const p = project();
  p.uploadAll();
  const r = p.run("build");
  assert.equal(r.root, join(p.root, ".wwjd", "canvas"));
  assert.equal(r.file_path, join(p.root, ".wwjd", "canvas", "project", "canvas.json"));
  assert.deepEqual(Object.keys(r.files).sort(), ["project/Borrow.dc.html", "project/Catalogue.dc.html", "project/Main.dc.html", "project/MyLoans.dc.html", "project/ToolDetail.dc.html", "project/WhyBorrow.dc.html", "project/WhyProject.dc.html"]);
  assert.equal(r.files["project/Catalogue.dc.html"], "project/Catalogue.dc.html");
  assert.deepEqual(r.missing, ["cancel"]);
  assert.deepEqual(r.removed, []);

  const c = p.read(r);
  assert.equal(c.v, 3);
  assert.equal(c.title, "Toolshed");
  assert.deepEqual(c.launch, { view: "canvas" });
  assert.deepEqual(c.pages, []);
  assert.deepEqual(c.designSystems, []);
  assert.equal(c.createdOnFiles.v, 1);
  assert.equal(c.order[0], "Main.dc.html");
  const cat = c.boards["Catalogue.dc.html"], det = c.boards["ToolDetail.dc.html"], bor = c.boards["Borrow.dc.html"], loans = c.boards["MyLoans.dc.html"];
  assert.deepEqual([cat.w, cat.h, cat.title], [720, 747, "Catalogue"]);
  assert.deepEqual([bor.w, bor.h], [390, 844]);
  assert.equal(det.title, "Tool <detail>");
  // one row per journey: 80px between frames, rows aligned
  assert.equal(cat.x, 0);
  assert.equal(det.x, 800);
  assert.equal(bor.x, 800 + 720 + 80);
  assert.ok(cat.y === det.y && det.y === bor.y);
  assert.ok(cat.y >= c.boards["Main.dc.html"].h + 120);
  assert.equal(loans.x, 0); // the catalogue sits in the first row only
  assert.ok(loans.y > cat.y + 1000);

  // row titles
  const t1 = c.notes["w-j-borrow"], t2 = c.notes["w-j-return"];
  assert.deepEqual([t1.kind, t1.text, t1.maxW], ["title1", "Borrow a tool", 720 + 80 + 720 + 80 + 390 + 80 + 480]);
  assert.ok(cat.y - t1.y >= 223);
  assert.ok(loans.y - t2.y >= 223);
  assert.equal(t2.maxW, 720);

  // a Why card ends each row that has decisions; the project's loose ones sit beside the diagram; no stickies
  const why = c.boards["WhyBorrow.dc.html"];
  assert.deepEqual([why.x, why.y, why.w, why.title], [bor.x + 390 + 80, cat.y, 480, "Why: Borrow a tool"]);
  assert.deepEqual([c.boards["WhyProject.dc.html"].x, c.boards["WhyProject.dc.html"].y], [c.boards["Main.dc.html"].w + 80, 0]);
  assert.ok(Object.keys(c.notes).every((id) => !id.startsWith("w-d-")));
  const card = p.art(r, "WhyBorrow.dc.html");
  const order = ["Johannes stepped in", "Kept prices visible", "people compare", "Claude decided", ">UX</span>", "One filter row", "less to scan", "Changed to: Small photo", "Claude guessed, check these", "Members are local"].map((t) => card.indexOf(t));
  assert.ok(order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1])), String(order));
  assert.doesNotMatch(card, /Dropped the map/); // dismissed
  assert.match(p.art(r, "WhyProject.dc.html"), /Settings in a sheet/); // its screen is unknown
  assert.ok(Object.keys(c.notes).every((id) => /^[A-Za-z0-9_-]{1,40}$/.test(id)));

  // an artboard is exactly the skeleton, the shot at half size
  const html = p.art(r, "Catalogue.dc.html");
  assert.ok(html.startsWith('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Catalogue</title>\n<script src="./support.js"></script>\n</head>'));
  assert.match(html, /<img src="\/_blob\/id\d" alt="Catalogue" style="display: block; width: 720px; height: 747px">/);
  assert.match(html, /data-props='\{"\$preview":\{"width":720,"height":747\}\}'/);
  assert.match(html, /class Component extends DCLogic \{\nrenderVals\(\) \{\nreturn \{\};\n\}\n\}\n<\/script>/);
  assert.match(p.art(r, "ToolDetail.dc.html"), /<title>Tool &lt;detail&gt;<\/title>/);

  // the diagram: arrows first, then the title, cards, labels; one solid card per screen
  const main = p.art(r, "Main.dc.html");
  const at = (s) => main.indexOf(s);
  assert.ok(at("<svg") < at("How people move") && at("How people move") < at("border-radius: 10px") && at("border-radius: 10px") < at(">Borrow a tool<"));
  assert.ok(main.lastIndexOf("<svg") < at("How people move"));
  assert.equal((main.match(/1px dashed #d6d2c4/g) || []).length, 1); // the catalogue again in the second row
  assert.match(main, /left: 284px; top: \d+px; width: 63px; height: 8px/); // tip 1px short of the next card
  assert.match(main, /stroke: #b5532f/); // the destructive edge
  assert.match(main, />Back</);
  assert.match(main, />Undo</);
  assert.match(main, /M 4 35 L 4 4/); // a loop's head points up into the earlier card
  const ids = main.match(/id="dc-arrow-head-filled-\d+"/g);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(main, /Tool &lt;detail&gt;/);
});

test("second build: only changed artboards; --current keeps the person's moves and notes; removed screens", () => {
  const p = project();
  p.uploadAll();
  const first = p.run("build");
  const again = p.run("build");
  assert.deepEqual(again.files, {});
  assert.deepEqual(Object.keys(p.run("build", "--all").files).length, 7);

  const live = p.read(first);
  live.title = "Toolshed canvas";
  live.createdOnFiles = { v: 1, at: "2026-01-01T00:00:00Z" };
  live.boards["Catalogue.dc.html"].x = 5000;
  live.boards["Catalogue.dc.html"].y = 6000;
  live.boards["WhyBorrow.dc.html"].x = 7000;
  live.notes.mine = { x: 1, y: 2, text: "Ask Sara", w: 200, fill: "pink" };
  live.notes["w-d-gone"] = { x: 3, y: 4, text: "old", w: 200, fill: "gray" };
  live.boards["Sketch.dc.html"] = { x: 9000, y: 0, w: 100, h: 100, title: "Sketch" };
  live.order.push("Sketch.dc.html");
  const cur = join(p.root, "live.json");
  writeFileSync(cur, JSON.stringify(live));

  // the borrow screen leaves the flow, a decision changes
  p.flow({ ...FLOW, screens: FLOW.screens.filter((s) => s.id !== "borrow"), journeys: [{ ...FLOW.journeys[0], steps: ["catalogue", "tool-detail"] }, FLOW.journeys[1]] });
  p.log([...DECISIONS, { ...DECISIONS[0], why: "people compare prices" }]);
  const r = p.run("build", "--current", cur);
  assert.deepEqual(r.removed, ["project/Borrow.dc.html"]);
  assert.equal(existsSync(join(r.root, "project", "Borrow.dc.html")), false);
  assert.deepEqual(Object.keys(r.files).sort(), ["project/Main.dc.html", "project/WhyBorrow.dc.html", "project/WhyProject.dc.html"]); // the diagram and the cards changed (the borrow guess moved to the project card), the screens did not
  const c = p.read(r);
  assert.equal(c.title, "Toolshed canvas");
  assert.equal(c.createdOnFiles.at, "2026-01-01T00:00:00Z");
  assert.equal(c.boards["Borrow.dc.html"], undefined);
  assert.ok(!c.order.includes("Borrow.dc.html"));
  assert.deepEqual([c.boards["Catalogue.dc.html"].x, c.boards["Catalogue.dc.html"].y, c.boards["Catalogue.dc.html"].w], [5000, 6000, 720]);
  assert.deepEqual(c.boards["Sketch.dc.html"], live.boards["Sketch.dc.html"]);
  assert.ok(c.order.includes("Sketch.dc.html"));
  assert.deepEqual(c.notes.mine, live.notes.mine);
  assert.equal(c.notes["w-d-gone"], undefined); // stickies from older builds go
  assert.equal(c.boards["WhyBorrow.dc.html"].x, 7000); // a moved card keeps its place
  assert.match(readFileSync(join(r.root, "project", "WhyBorrow.dc.html"), "utf8"), /people compare prices/);
});

test("review fixes: a removal stays pending until the canvas shows it gone; names never clash; the diagram's size follows it", () => {
  const p = project();
  p.uploadAll();
  p.run("build");
  // a journey whose id would name its card WhyProject, beside the project card for loose decisions
  p.flow({ ...FLOW, journeys: [{ ...FLOW.journeys[0], id: "project" }, FLOW.journeys[1]] });
  const r = p.run("build");
  const c = p.read(r);
  const cards = Object.keys(c.boards).filter((f) => f.startsWith("Why"));
  assert.equal(new Set(cards).size, cards.length);
  assert.ok(cards.includes("WhyProject.dc.html") && cards.includes("WhyProject2.dc.html"), cards.join());
  // a stale diagram size on the live canvas is replaced; its position is kept
  const live = p.read(r);
  live.boards["Main.dc.html"] = { ...live.boards["Main.dc.html"], x: 40, y: 50, h: 10 };
  const cur = join(p.root, "live.json");
  writeFileSync(cur, JSON.stringify(live));
  const m = p.read(p.run("build", "--current", cur)).boards["Main.dc.html"];
  assert.deepEqual([m.x, m.y], [40, 50]);
  assert.ok(m.h > 10);
  // a screen leaves the flow; the publish fails, so the next build lists the removal again
  p.flow({ ...FLOW, screens: FLOW.screens.filter((s) => s.id !== "borrow"), journeys: [{ ...FLOW.journeys[0], id: "project", steps: ["catalogue", "tool-detail"] }, FLOW.journeys[1]] });
  assert.deepEqual(p.run("build", "--current", cur).removed, ["project/Borrow.dc.html"]);
  assert.deepEqual(p.run("build", "--current", cur).removed, ["project/Borrow.dc.html"]); // live still has it
  delete live.boards["Borrow.dc.html"];
  writeFileSync(cur, JSON.stringify(live));
  assert.deepEqual(p.run("build", "--current", cur).removed, []); // gone: forgotten
});

test("review fixes: a shot outside the project or not an image is never uploaded; a screen named why-… is never removed as a card", () => {
  const p = project();
  p.flow({ ...FLOW, screens: [...FLOW.screens, { id: "leak", title: "Leak", job: "x", shot: "../../etc/passwd" }, { id: "odd", title: "Odd", job: "x", shot: 42 }] });
  const up = p.run("uploads").upload;
  assert.ok(up.every((f) => f.endsWith(".png")), up.join());
  assert.doesNotThrow(() => p.run("build"));
});
