#!/usr/bin/env node
// render: look at the real render. Headless Chromium via Playwright.
//
// Usage: node render.mjs <command> <url|file> [options]
//   shoot    screenshots. Default matrix: 1440 and 390, light and dark, full page.
//     --one              one shot: the primary width, one theme (the quick loop's per-handover look)
//     --width <px>       primary width for --one (default: 1440 for operate/monitor, else 390; from --register or .wwjd.json)
//     --theme light|dark --widths 1440,390 --out <dir> (default .wwjd/shots)  --full (full page with --one)
//   fit      resize a page or story and catch components that break as they shrink
//     --widths 240,320,480,720  --selector "<container css>" (resize that element, not the viewport)
//     identifier-clipped · identifier-long · icon-detached · overflow · hover-shift · hover-unreachable ·
//     text-collapsed · ring-clipped · value-fill-empty · control-height-mismatch
//   runtime  the milestone checks: page-overflow (320/390/768/1440/1920), clipped-text, small-target (<24px),
//     hover-shift (layout shift after hovering rows), focus-hidden (Tab stops invisible or under sticky chrome),
//     reduced-motion (transform animations left under reduce), broken-image, spacing-drift (radii, max-widths, button styles),
//     target-hole (text above a stretched card link: a text cursor, the hover drops)
//   --json    machine output. Exit 1 on errors.
// Playwright: resolved from this project (npm i -D playwright) or this script's folder.
// PW_EXE=<path to a Chromium binary> uses an existing build instead of the bundled one.
// No Playwright: shoot falls back to an installed Chrome or Chromium (PW_EXE, CHROME_PATH, the usual places), headless,
// one viewport per shot (no full page); fit and runtime still need Playwright.
// Read every PNG yourself: a report about a screenshot is not a look.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const cmd = args[0];
if (!cmd || cmd === "-h" || cmd === "--help" || !["shoot", "fit", "runtime"].includes(cmd)) {
  const head = [];
  for (const l of readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1)) { if (!l.startsWith("//")) break; head.push(l.replace(/^\/\/ ?/, "")); }
  console.log(head.join("\n")); process.exit(cmd ? 0 : 2);
}
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const VALUED = new Set(["--width", "--widths", "--theme", "--out", "--selector", "--register"]);
const target = args.slice(1).find((a, i, xs) => !a.startsWith("--") && !VALUED.has(xs[i - 1]));
if (!target) { console.error(`usage: render.mjs ${cmd} <url|file> [options]`); process.exit(2); }
const url = /^[a-z][\w+.-]*:/i.test(target) ? target : pathToFileURL(resolve(target)).href;
const json = flag("--json");

let chromium;
for (const from of [import.meta.url, pathToFileURL(join(process.cwd(), "package.json")).href]) {
  for (const mod of ["playwright", "playwright-core"]) {
    try { const m = await import(pathToFileURL(createRequire(from).resolve(mod)).href); chromium = m.chromium || m.default?.chromium; if (chromium) break; } catch { /* next */ }
  }
  if (chromium) break;
}
// Can't render: say so, and leave .wwjd/shots/UNAVAILABLE so the Strictness gate (gate.mjs) knows it was tried.
function unavailable(why) {
  console.error(why);
  try { mkdirSync(".wwjd/shots", { recursive: true }); writeFileSync(".wwjd/shots/UNAVAILABLE", why + "\n"); } catch { /* read-only */ }
  process.exit(2);
}
// Shots without Playwright: a system Chrome's own headless screenshot, the same file names as below.
function systemChrome() {
  const named = [process.env.PW_EXE, process.env.CHROME_PATH].filter(Boolean);
  const mac = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"];
  for (const p of [...named, ...mac]) if (existsSync(p)) return p;
  for (const bin of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try { return execFileSync("which", [bin], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null; } catch { /* next */ }
  }
  return null;
}
if (!chromium && cmd === "shoot") {
  const exe = systemChrome();
  if (exe) {
    const out = opt("--out", ".wwjd/shots");
    mkdirSync(out, { recursive: true });
    const slug = (url.startsWith("file:") ? target.split("/").pop().replace(/\.\w+$/, "") : target.replace(/^[a-z]+:\/\//, "")).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    let reg = null;
    try { reg = opt("--register") || JSON.parse(readFileSync(".wwjd.json", "utf8")).register; } catch { /* none */ }
    const primary = Number(opt("--width", 0)) || (["operate", "monitor"].includes((reg || "operate").toLowerCase()) ? 1440 : 390);
    const widths = flag("--one") ? [primary] : opt("--widths", "1440,390").split(",").map(Number);
    const themes = flag("--one") || opt("--theme") ? [opt("--theme", "light")] : ["light", "dark"];
    for (const w of widths) for (const scheme of themes) {
      const f = join(out, `${slug}-${w}-${scheme}.png`);
      try {
        execFileSync(exe, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
          `--window-size=${w},${w < 800 ? 844 : 900}`, `--blink-settings=preferredColorScheme=${scheme === "dark" ? 0 : 1}`,
          "--virtual-time-budget=1500", `--screenshot=${resolve(f)}`, url], { stdio: "ignore", timeout: 30000 });
        console.log(f + "  (system Chrome, viewport only)");
      } catch (e) { console.error(`render: Chrome could not shoot ${w}px ${scheme}: ${e.message.split("\n")[0]}`); }
    }
    process.exit(0);
  }
}
if (!chromium) unavailable("render needs Playwright: npm i -D playwright (and npx playwright install chromium, or set PW_EXE)");
let browser;
try { browser = await chromium.launch({ headless: true, executablePath: process.env.PW_EXE || undefined }); }
catch (e) { unavailable("render: no Chromium. Run npx playwright install chromium, or set PW_EXE.\n" + e.message.split("\n")[0]); }
const H = (w) => (w < 800 ? 844 : 900);
const findings = [];
const add = (width, rule, severity, what) => findings.push({ width, rule, severity, what });

function register() {
  if (opt("--register")) return opt("--register").toLowerCase();
  try { return JSON.parse(readFileSync(".wwjd.json", "utf8")).register?.toLowerCase(); } catch { return null; }
}

// ── shoot ──────────────────────────────────────────────────────────
if (cmd === "shoot") {
  const out = opt("--out", ".wwjd/shots");
  mkdirSync(out, { recursive: true });
  const slug = (url.startsWith("file:") ? target.split("/").pop().replace(/\.\w+$/, "") : target.replace(/^[a-z]+:\/\//, "")).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const primary = Number(opt("--width", 0)) || (["operate", "monitor"].includes(register() || "operate") ? 1440 : 390);
  const widths = flag("--one") ? [primary] : opt("--widths", "1440,390").split(",").map(Number);
  const themes = flag("--one") || opt("--theme") ? [opt("--theme", "light")] : ["light", "dark"];
  for (const w of widths) for (const scheme of themes) {
    const page = await browser.newPage({ viewport: { width: w, height: H(w) }, colorScheme: scheme });
    const errs = []; page.on("pageerror", (e) => errs.push(e.message));
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => page.goto(url));
    await page.waitForTimeout(500);
    const f = join(out, `${slug}-${w}-${scheme}.png`);
    await page.screenshot({ path: f, fullPage: !flag("--one") || flag("--full") });
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(f + (ox > 1 ? `  (scrolls sideways by ${ox}px)` : "") + (errs.length ? `  (page errors: ${errs.slice(0, 2).join(" | ")})` : ""));
    await page.close();
  }
  await browser.close();
  process.exit(0);
}

// ── fit ────────────────────────────────────────────────────────────
if (cmd === "fit") {
  const widths = opt("--widths", "240,320,480,720").split(",").map(Number);
  const selector = opt("--selector", null);
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
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if ((cs.clipPath && cs.clipPath !== "none" || cs.maskImage && cs.maskImage !== "none") && el.children.length) {
          const b = el.getBoundingClientRect();
          if (b.width < 1 || b.height < 1) { out.push(["value-fill-empty", "error", (el.closest("[aria-label],[role]")?.getAttribute("aria-label") || el.className || el.tagName) + " has no box, so its fill shows nothing"]); break; }
        }
      }
      const isCtl = (el) => el.matches("button, input:not([type=checkbox]):not([type=radio]), select, [role=group], [role=spinbutton]") || (getComputedStyle(el).borderTopStyle !== "none" && parseFloat(getComputedStyle(el).borderTopWidth) > 0 && el.querySelector("button, input"));
      for (const p of root.querySelectorAll("*")) {
        const pc = getComputedStyle(p);
        if (!(pc.display.includes("flex") && !pc.flexDirection.startsWith("column")) && !pc.display.includes("grid")) continue;
        const kids = [...p.children].filter((k) => k.getClientRects().length && isCtl(k));
        if (kids.length < 2) continue;
        const rows = {};
        for (const k of kids) { const b = k.getBoundingClientRect(); (rows[Math.round(b.top / 8)] ||= []).push(b.height); }
        const bad = Object.values(rows).find((hs) => hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 1.5);
        if (bad) { out.push(["control-height-mismatch", "error", (p.className || p.tagName) + ": " + bad.map((h) => Math.round(h)).join(" vs ") + "px"]); break; }
      }
      for (const el of root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,label,[data-identifier],td,dd,span")) {
        if (!el.offsetParent || el.children.length > 2) continue;
        const t = (el.textContent || "").trim(); if (t.length < 12) continue;
        const ch = parseFloat(getComputedStyle(el).fontSize) * 0.55;
        const b = el.getBoundingClientRect();
        if (b.width < ch * 6 && b.height / lineH(el) > 2.5) { out.push(["text-collapsed", "error", name(el) + " (" + Math.round(b.width) + "px wide)"]); break; }
      }
      for (const icon of root.querySelectorAll("[data-trailing-icon]")) {
        const label = icon.previousElementSibling || icon.parentElement;
        const range = document.createRange(); range.selectNodeContents(label);
        const last = [...range.getClientRects()].filter((x) => x.width > 0).at(-1);
        if (last && Math.abs(icon.getBoundingClientRect().top - last.top) > lineH(label) / 2) out.push(["icon-detached", "error", name(label)]);
      }
      const rr = root.getBoundingClientRect();
      if (root.scrollWidth > root.clientWidth + 1) out.push(["overflow", "error", "container scrolls sideways"]);
      const inScroller = (el) => { for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (getComputedStyle(p).overflowX !== "visible") return true; return false; };
      for (const el of root.querySelectorAll("*")) { const b = el.getBoundingClientRect(); if (b.width && b.right > rr.right + 1 && getComputedStyle(el).position !== "fixed" && !inScroller(el)) { out.push(["overflow", "error", el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 2).join(".")]); break; } }
      return out;
    }, selector);
    for (const [rule, sev, what] of r) add(w, rule, sev, what);
    if (await hoverShift(page, selector)) add(w, "hover-shift", "error", "a row moves its siblings on hover");
    const hidden = await page.evaluate((sel) => {
      const root = sel ? document.querySelector(sel) : document;
      const b = [...root.querySelectorAll("button, a[href]")].find((x) => getComputedStyle(x).opacity === "0");
      if (!b) return false; b.focus(); return !(getComputedStyle(b).opacity !== "0" && document.activeElement === b);
    }, selector);
    if (hidden) add(w, "hover-unreachable", "error", "an action hidden at rest stays hidden when focused");
    const ringCut = await page.evaluate((sel) => {
      const root = sel ? document.querySelector(sel) : document;
      for (const el of [...root.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"], [aria-selected="true"], [aria-current], [data-selected]')].slice(0, 80)) {
        if (!el.getClientRects().length) continue;
        el.focus?.({ preventScroll: true });
        const cs = getComputedStyle(el);
        const spread = cs.outlineStyle !== "none" ? Math.max(0, (parseFloat(cs.outlineWidth) || 0) + (parseFloat(cs.outlineOffset) || 0)) : 0;
        const sh = /(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px\s+(\d+)px/.exec(cs.boxShadow || "");
        const ring = Math.max(spread, sh && !/inset/.test(cs.boxShadow) ? +sh[4] : 0);
        if (!ring) continue;
        const r = el.getBoundingClientRect();
        for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
          const pc = getComputedStyle(p);
          if (pc.overflowX === "visible" && pc.overflowY === "visible") continue;
          const pr = p.getBoundingClientRect();
          if (r.left - ring < pr.left - 0.5 || r.right + ring > pr.right + 0.5 || r.top - ring < pr.top - 0.5 || r.bottom + ring > pr.bottom + 0.5)
            return (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40) + " inside " + p.tagName.toLowerCase() + (p.className ? "." + String(p.className).split(" ")[0] : "");
          break;
        }
      }
      return null;
    }, selector);
    if (ringCut) add(w, "ring-clipped", "error", ringCut);
    await page.close();
  }
  finish(`fit ${widths.join("/")}px`);
}

// hovering the first rows must not move their siblings
async function hoverShift(page, selector) {
  const rows = await page.$$(`${selector ? selector + " " : ""}:is([data-row], [role=row], li, tr)`);
  for (const row of rows.slice(0, 5)) {
    if (!(await row.isVisible())) continue;
    const boxes = () => page.evaluate((row) => [...row.parentElement.children].map((c) => { const b = c.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; }), row);
    const before = await boxes();
    try { await row.hover({ timeout: 2000 }); } catch { continue; }
    await page.waitForTimeout(160);
    const after = await boxes();
    if (before.some((b, i) => b.some((v, j) => Math.abs(v - after[i][j]) > 0.5))) return true;
  }
  return false;
}

// ── runtime ────────────────────────────────────────────────────────
if (cmd === "runtime") {
  const widths = opt("--widths", "320,390,768,1440,1920").split(",").map(Number);
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: H(w) } });
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => page.goto(url));
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const out = [];
      const vis = (el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
      const ox = document.documentElement.scrollWidth - innerWidth;
      if (ox > 1) out.push(["page-overflow", "error", `scrolls sideways by ${ox}px`]);
      for (const el of document.querySelectorAll("body *")) {
        if (!vis(el) || !el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.overflowX === "visible" && el.scrollWidth > el.clientWidth + 1 && cs.display !== "inline" && cs.textOverflow !== "ellipsis") { out.push(["clipped-text", "warn", el.tagName.toLowerCase() + ": " + el.textContent.trim().slice(0, 40)]); break; }
      }
      const small = [...document.querySelectorAll("a[href], button, input, select, textarea, [role=button], [tabindex='0']")].filter((el) => {
        if (!vis(el)) return false;
        const st = getComputedStyle(el, "::after"); // a stretched link's target is its card
        const b = (st.content !== "none" && st.position === "absolute" && el.offsetParent ? el.offsetParent : el).getBoundingClientRect();
        if (el.closest("p, li") && el.tagName === "A" && getComputedStyle(el).display === "inline") return false; // links in running text
        return b.width < 24 || b.height < 24;
      });
      if (small.length) out.push(["small-target", "error", `${small.length} under 24px, e.g. ${(small[0].getAttribute("aria-label") || small[0].textContent || small[0].tagName).trim().slice(0, 30)}`]);
      for (const img of document.images) if (img.complete && img.naturalWidth === 0 && vis(img)) { out.push(["broken-image", "error", img.getAttribute("src")?.slice(0, 60) || "img"]); break; }
      // spacing drift by purpose
      const set = (sel, prop) => new Set([...document.querySelectorAll(sel)].filter(vis).map((el) => getComputedStyle(el)[prop]).filter((v) => v && v !== "none" && v !== "0px" && v !== "auto"));
      const radii = set("button, input, .card, [class*=card], [role=dialog], img", "borderTopLeftRadius");
      const widths = set("main *, article *", "maxWidth");
      const btn = new Set([...document.querySelectorAll("button, .btn, [role=button]")].filter(vis).map((el) => { const c = getComputedStyle(el); return [c.height, c.borderTopLeftRadius, c.fontWeight, c.paddingLeft].join("/"); }));
      if (radii.size > 3) out.push(["spacing-drift", "warn", `${radii.size} radii: ${[...radii].slice(0, 6).join(" ")}`]);
      if (widths.size > 3) out.push(["spacing-drift", "warn", `${widths.size} max-widths`]);
      if (btn.size > 6) out.push(["spacing-drift", "warn", `${btn.size} button shapes`]);
      const CTRL = "a[href], button, input, select, textarea, label, summary, [role=button], [tabindex]";
      for (const t of [...document.querySelectorAll("a[href], button")].filter(vis).slice(0, 60)) {
        const a = getComputedStyle(t, "::after"); if (a.content === "none" || a.position !== "absolute" || t.offsetParent === document.body) continue;
        const c = t.offsetParent?.getBoundingClientRect(); if (!c || c.width < 80 || c.height < 40 || c.bottom < 0 || c.top > innerHeight) continue;
        let hole = null;
        for (let i = 1; i < 6 && !hole; i++) for (let j = 1; j < 6 && !hole; j++) {
          const h = document.elementFromPoint(c.left + c.width * i / 6, c.top + c.height * j / 6);
          if (h && h !== t && t.offsetParent.contains(h) && !h.closest(CTRL)) hole = h;
        }
        if (hole) { out.push(["target-hole", "error", `${(hole.className || hole.tagName).toString().split(" ")[0]} sits above the stretched link: text cursor, hover drops`]); break; }
      }
      return out;
    });
    for (const [rule, sev, what] of r) add(w, rule, sev, what);
    if (w === widths.at(-1) || w === 1440) {
      // layout shift after hovering rows
      await page.evaluate(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: false }); });
      if (await hoverShift(page, null)) add(w, "hover-shift", "error", "a row moves its siblings on hover");
      const cls = await page.evaluate(() => window.__cls);
      if (cls > 0.001) add(w, "hover-shift", "error", `layout shift ${cls.toFixed(3)} while hovering`);
      // focus: Tab through, every stop visible and not under sticky chrome
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press("Tab");
        const bad = await page.evaluate(() => {
          const el = document.activeElement; if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const has = (c) => (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) || (c.boxShadow && c.boxShadow !== "none");
          const ox = (c) => c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0;
          // the ring may sit on the stretched ::after or on the card (:has(:focus-visible))
          const ring = has(cs) || has(getComputedStyle(el, "::after")) || [el.parentElement, el.parentElement?.parentElement, el.offsetParent].some((p) => p && ox(getComputedStyle(p)));
          const label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30);
          if (!ring) return "no visible focus on " + label;
          const b = el.getBoundingClientRect();
          if (b.width && b.height && b.top >= 0 && b.bottom <= innerHeight) {
            const hit = document.elementFromPoint(b.left + b.width / 2, b.top + Math.min(b.height / 2, 4));
            if (hit && !el.contains(hit) && !hit.contains(el)) return label + " is under " + hit.tagName.toLowerCase();
          }
          return null;
        });
        if (bad) { add(w, "focus-hidden", "error", bad); break; }
      }
    }
    await page.close();
  }
  // reduced motion: no transform animation may remain
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" }).catch(() => page.goto(url));
  const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getKeyframes?.().some((k) => k.transform || k.translate || k.scale || k.rotate)).length);
  if (moving) add(1440, "reduced-motion", "error", `${moving} transform animations still run under prefers-reduced-motion`);
  await page.close();
  finish(`runtime ${widths.join("/")}px`);
}

function finish(label) {
  const errors = findings.filter((f) => f.severity === "error").length;
  if (json) console.log(JSON.stringify({ url: target, errors, findings }, null, 2));
  // The runtime report: what the Strictness gate (gate.mjs) reads at 4 and up.
  if (cmd === "runtime") { try { mkdirSync(".wwjd", { recursive: true }); writeFileSync(".wwjd/runtime.json", JSON.stringify({ url: target, errors, findings }, null, 2)); } catch { /* read-only */ } }
  else { for (const f of findings) console.log(`${String(f.width).padStart(4)}px  ${f.severity === "error" ? "ERROR" : "warn "} ${f.rule}: ${f.what}`); console.log(`\nrender ${label}: ${errors} errors, ${findings.length - errors} warnings`); }
  browser.close().then(() => process.exit(errors ? 1 : 0));
}
