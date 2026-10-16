#!/usr/bin/env node
// fit-check: render a page or story at several widths and catch components that break as they shrink.
//
// Usage: node fit-check.mjs <url> [--widths 240,320,480,720] [--selector "<container css>"] [--json]
//   --selector: the element to resize (a story's root); without it the viewport is resized.
// Checks, per width:
//   identifier-clipped   [data-identifier], h1–h6 cut off (scroll > client)
//   identifier-long      identifier over 3 lines (warn: the layout should have switched)
//   icon-detached        [data-trailing-icon] not on the last line of its label, or a chevron alone on a line
//   overflow             anything wider than the container
//   hover-shift          hovering a row ([data-row], [role=row], li) moves a sibling by > 0.5px
//   hover-unreachable    an action hidden at rest that keyboard focus doesn't reveal
// Needs Playwright installed in the project (npm i -D playwright; npx playwright install chromium).
// PW_EXE=<path> points it at an existing Chromium build instead.
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.error("fit-check needs the playwright package (npm i -D playwright, or npx -p playwright)"); process.exit(2); }

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error("usage: fit-check.mjs <url> [--widths 240,320,480,720] [--selector css] [--json]"); process.exit(2); }
const widths = opt("--widths", "240,320,480,720").split(",").map(Number);
const selector = opt("--selector", null);
const json = args.includes("--json");

const browser = await chromium.launch({ executablePath: process.env.PW_EXE || undefined });
const findings = [];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: selector ? 1280 : w, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  if (selector) await page.evaluate(([s, w]) => { const el = document.querySelector(s); if (el) { el.style.inlineSize = w + "px"; el.style.containerType = "inline-size"; } }, [selector, w]);
  await page.waitForTimeout(150);
  const r = await page.evaluate((sel) => {
    const out = [];
    const root = sel ? document.querySelector(sel) : document.documentElement;
    const lineH = (el) => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
    const name = (el) => (el.getAttribute("data-identifier") || el.textContent || "").trim().slice(0, 40);
    for (const el of root.querySelectorAll("[data-identifier], h1, h2, h3, h4, h5, h6")) {
      if (!el.offsetParent && el.tagName !== "BODY") continue;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.push(["identifier-clipped", "error", name(el)]);
      else if (el.getBoundingClientRect().height / lineH(el) > 3.5) out.push(["identifier-long", "warn", name(el)]);
    }
    for (const icon of root.querySelectorAll("[data-trailing-icon]")) {
      const label = icon.previousElementSibling || icon.parentElement;
      const range = document.createRange(); range.selectNodeContents(label);
      const rects = [...range.getClientRects()].filter((x) => x.width > 0);
      const last = rects.at(-1); const ir = icon.getBoundingClientRect();
      if (last && Math.abs(ir.top - last.top) > lineH(label) / 2) out.push(["icon-detached", "error", name(label)]);
    }
    const rr = root.getBoundingClientRect();
    if (root.scrollWidth > root.clientWidth + 1) out.push(["overflow", "error", "container scrolls sideways"]);
    for (const el of root.querySelectorAll("*")) { const b = el.getBoundingClientRect(); if (b.width && b.right > rr.right + 1 && getComputedStyle(el).position !== "fixed") { out.push(["overflow", "error", el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 2).join(".")]); break; } }
    return out;
  }, selector);
  for (const [rule, sev, what] of r) findings.push({ width: w, rule, severity: sev, what });

  // hover shift + keyboard reachability on the first few rows
  const rows = await page.$$(`${selector ? selector + " " : ""}:is([data-row], [role=row], li)`);
  for (const row of rows.slice(0, 5)) {
    const before = await page.evaluate((row) => [...row.parentElement.children].map((c) => { const b = c.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; }), row);
    await row.hover();
    await page.waitForTimeout(160);
    const after = await page.evaluate((row) => [...row.parentElement.children].map((c) => { const b = c.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; }), row);
    if (before.some((b, i) => b.some((v, j) => Math.abs(v - after[i][j]) > 0.5))) { findings.push({ width: w, rule: "hover-shift", severity: "error", what: "a row moves its siblings on hover" }); break; }
  }
  const hidden = await page.evaluate((sel) => {
    const root = sel ? document.querySelector(sel) : document;
    return [...root.querySelectorAll("button, a[href]")].filter((b) => getComputedStyle(b).opacity === "0" || getComputedStyle(b).visibility === "hidden" || getComputedStyle(b).display === "none" && b.closest("[data-row], [role=row], li")).length;
  }, selector);
  if (hidden) {
    const revealed = await page.evaluate((sel) => {
      const root = sel ? document.querySelector(sel) : document;
      const b = [...root.querySelectorAll("button, a[href]")].find((x) => getComputedStyle(x).opacity === "0");
      if (!b) return true; b.focus(); return getComputedStyle(b).opacity !== "0" && document.activeElement === b;
    }, selector);
    if (!revealed) findings.push({ width: w, rule: "hover-unreachable", severity: "error", what: "an action hidden at rest stays hidden when focused" });
  }
  await page.close();
}
await browser.close();

const errors = findings.filter((f) => f.severity === "error").length;
if (json) console.log(JSON.stringify({ url, widths, errors, findings }, null, 2));
else { for (const f of findings) console.log(`${String(f.width).padStart(4)}px  ${f.severity === "error" ? "ERROR" : "warn "} ${f.rule}: ${f.what}`); console.log(`\nfit-check: ${widths.join("/")}px, ${errors} errors, ${findings.length - errors} warnings`); }
process.exit(errors ? 1 : 0);
