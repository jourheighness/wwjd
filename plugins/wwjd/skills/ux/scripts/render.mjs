#!/usr/bin/env node
// render: look at the real render. Headless Chromium via Playwright.
//
// Usage: node render.mjs <command> <url|file> [options]
//   shoot    screenshots. Default matrix: 1440 and 390, light and dark, full page.
//     --one              one shot: the primary width, one theme (the quick loop's per-handover look)
//     --width <px>       primary width for --one (default: 1440 for operate/monitor, else 390; from --register or .wwjd.json)
//     --theme light|dark --widths 1440,390 --out <dir> (default .wwjd/shots)  --full (full page with --one)
//     --root <dir>       the project whose .wwjd/ gets the shots and reports (a session in one repo checking another)
//   .wwjd/ is at the nearest folder up with .wwjd.json or .wwjd/, else the git root, else here (what gate.mjs reads).
//   Dark: prefers-color-scheme, then the page's stored theme set to dark; a page that stays light gets no dark shot
//   ("dark not applied", exit 1).
//   fit      resize a page or story and catch components that break as they shrink (also orphan-item: a lone
//            avatar, icon, dot or badge wrapped onto its own line, in a flex row or in running text); writes
//            .wwjd/fit.json for the Strictness gate
//     --widths 240,320,480,720  --selector "<container css>" (resize that element, not the viewport)
//     identifier-clipped · identifier-long · icon-detached · overflow · overlap (text or controls drawn over each
//     other) · text-sliced (cut mid-line by an overflow clip) · hover-shift · hover-unreachable · text-collapsed ·
//     ring-clipped · value-fill-empty · control-height-mismatch. Visually hidden (sr-only) text is skipped.
//   runtime  the milestone checks: page-overflow (320/390/768/1440/1920), clipped-text, small-target (<24px),
//     hover-shift (layout shift after hovering rows), focus-hidden (Tab stops invisible or under sticky chrome),
//     reduced-motion (transform animations left under reduce), broken-image, spacing-drift (radii, max-widths, button styles),
//     target-hole (text above a stretched card link: a text cursor, the hover drops)
//   Animated pages: fit and runtime load under prefers-reduced-motion and settle every CSS or Web Animation (finite
//   ones finished, endless ones paused), so they measure the resting frame, never glyphs caught mid-roll; a
//   script-driven stage (canvas, rAF) rests there only if it honours reduced motion, as the Floor asks.
//   --wait-for "<css>"  wait for that element before any check or shot (data loaded); .wwjd.json "waitFor" sets it
//   per project. Web fonts are always awaited.
//   --json    machine output. Exit 1 on errors.
//   setup    one-time: npm-installs playwright-core into ~/.cache/wwjd (XDG_CACHE_HOME), for every project.
// Playwright (playwright or playwright-core), first found: WWJD_PLAYWRIGHT=<module folder>, this script's folder,
// this project (npm i -D playwright), the setup cache, the global npm root, the npx cache.
// Browser: PW_EXE=<path to a Chromium binary> when set, else Playwright's own Chromium, else an installed Chrome.
// No Playwright: shoot drives an installed Chrome or Chromium (PW_EXE, CHROME_PATH, the usual places) directly, same
// shots; fit and runtime still need Playwright. No shot at all → exit 2 and
// .wwjd/shots/UNAVAILABLE; some shots failed → exit 1.
// Read every PNG yourself: a report about a screenshot is not a look.
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { artifactRoot, nearestConfig } from "./paths.mjs";

const args = process.argv.slice(2);
const cmd = args[0];
// The setup cache: outside every project, so no node_modules lands in a repo.
const CACHE = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "wwjd");
if (cmd === "setup") {
  mkdirSync(CACHE, { recursive: true });
  if (!existsSync(join(CACHE, "package.json"))) writeFileSync(join(CACHE, "package.json"), '{ "private": true }\n');
  try { execFileSync("npm", ["install", "--no-audit", "--no-fund", "--prefix", CACHE, "playwright-core"], { stdio: "inherit" }); }
  catch (e) { console.error(`render setup: npm install failed (${e.message.split("\n")[0]})`); process.exit(2); }
  console.log(`Playwright in ${CACHE}. Browser: Playwright's Chromium (npx playwright install chromium), PW_EXE, or an installed Chrome.`);
  process.exit(0);
}
if (!cmd || cmd === "-h" || cmd === "--help" || !["shoot", "fit", "runtime"].includes(cmd)) {
  const head = [];
  for (const l of readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1)) { if (!l.startsWith("//")) break; head.push(l.replace(/^\/\/ ?/, "")); }
  console.log(head.join("\n")); process.exit(cmd ? 0 : 2);
}
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const VALUED = new Set(["--width", "--widths", "--theme", "--out", "--selector", "--register", "--root", "--wait-for"]);
const target = args.slice(1).find((a, i, xs) => !a.startsWith("--") && !VALUED.has(xs[i - 1]));
if (!target) { console.error(`usage: render.mjs ${cmd} <url|file> [options]`); process.exit(2); }
const url = /^[a-z][\w+.-]*:/i.test(target) ? target : pathToFileURL(resolve(target)).href;
// A missing page is an error, never a blank shot or a clean fit.
if (url.startsWith("file:")) {
  let file = null; try { file = fileURLToPath(url.replace(/[?#].*$/, "")); } catch { /* not a local path */ }
  if (file && !existsSync(file)) { console.error(`render: file not found: ${file}`); process.exit(1); }
}
const json = flag("--json");
const ROOT = opt("--root") ? resolve(opt("--root")) : artifactRoot(process.cwd());
const SHOTS = join(ROOT, ".wwjd", "shots");
const register = () => {
  if (opt("--register")) return opt("--register").toLowerCase();
  try { return JSON.parse(readFileSync(nearestConfig(ROOT), "utf8")).register?.toLowerCase() || null; } catch { return null; }
};
const H = (w) => (w < 800 ? 844 : 900);
const waitFor = (() => {
  if (opt("--wait-for")) return opt("--wait-for");
  try { return JSON.parse(readFileSync(nearestConfig(ROOT), "utf8")).waitFor || null; } catch { return null; }
})();

// shoot: one capture plan, whichever browser takes it
const plan = (() => {
  if (cmd !== "shoot") return null;
  const out = opt("--out") ? resolve(opt("--out")) : SHOTS;
  const slug = (url.startsWith("file:") ? target.split("/").pop().replace(/\.\w+$/, "") : target.replace(/^[a-z]+:\/\//, "")).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const primary = Number(opt("--width", 0)) || (["operate", "monitor"].includes(register() || "operate") ? 1440 : 390);
  const widths = flag("--one") ? [primary] : opt("--widths", "1440,390").split(",").map(Number);
  const themes = flag("--one") || opt("--theme") ? [opt("--theme", "light")] : ["light", "dark"];
  const shots = widths.flatMap((w) => themes.map((scheme) => ({ w, scheme, file: join(out, `${slug}-${w}-${scheme}.png`) })));
  return { out, shots, fullPage: !flag("--one") || flag("--full") };
})();

// Where Playwright may be installed, as folders module resolution starts from; later ones are only looked up
// when the earlier ones have none (npm root -g spawns npm).
function* playwrightBases() {
  if (process.env.WWJD_PLAYWRIGHT) yield resolve(process.env.WWJD_PLAYWRIGHT, "..", "..");
  yield new URL(".", import.meta.url).pathname;
  yield process.cwd();
  yield CACHE;
  try { yield resolve(execFileSync("npm", ["root", "-g"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 5000 }).trim(), ".."); } catch { /* no npm */ }
  const npx = join(homedir(), ".npm", "_npx");
  try {
    yield* readdirSync(npx).map((d) => join(npx, d)).filter((d) => existsSync(join(d, "node_modules", "playwright-core")))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  } catch { /* no npx cache */ }
}
let chromium;
for (const base of playwrightBases()) {
  for (const mod of ["playwright", "playwright-core"]) {
    try { const m = await import(pathToFileURL(createRequire(join(base, "package.json")).resolve(mod)).href); chromium = m.chromium || m.default?.chromium; if (chromium) break; } catch { /* next */ }
  }
  if (chromium) break;
}
// Can't render: say so, and leave .wwjd/shots/UNAVAILABLE so the Strictness gate (gate.mjs) knows it was tried.
function unavailable(why) {
  console.error(why);
  try { mkdirSync(SHOTS, { recursive: true }); writeFileSync(join(SHOTS, "UNAVAILABLE"), why + "\n"); } catch { /* read-only */ }
  process.exit(2);
}
// An installed Chrome: Playwright's fallback browser, and the shooter when there is no Playwright.
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
// Dark shots: emulating prefers-color-scheme is not enough for an app that keeps its theme in a saved setting. After
// load, LUMA reads the ground the viewer sees (the first opaque background under a few points, normalised through a
// canvas so oklch() and color() read too). Still light: the theme keys the page stored (values light/dark/system,
// plain or in JSON) plus the common names are set to dark before a reload. Still light then: no dark shot, and the
// report says so, so a light picture never passes as the dark one.
const LUMA = `(() => {
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#0000"; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return ctx.getImageData(0, 0, 1, 1).data; };
  const ground = (x, y) => {
    for (let el = document.elementFromPoint(x, y); el; el = el.parentElement) { const d = rgba(getComputedStyle(el).backgroundColor); if (d[3] > 128) return d; }
    const d = rgba(getComputedStyle(document.documentElement).backgroundColor); return d[3] > 128 ? d : [255, 255, 255];
  };
  const ls = [[innerWidth / 2, 8], [innerWidth / 2, innerHeight / 2], [8, innerHeight / 2], [innerWidth - 8, innerHeight - 8]]
    .map(([x, y]) => ground(x, y)).map(([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255).sort((a, b) => a - b);
  return (ls[1] + ls[2]) / 2;
})()`;
const THEME_KEYS = ["theme", "color-scheme", "colorScheme", "vite-ui-theme", "ui-theme", "theme-mode", "darkMode"];
const STORED = `JSON.stringify(Object.keys(localStorage).filter((k) => /^"?(light|dark|system|auto)"?$/i.test(localStorage.getItem(k) || "") || /"(theme|mode|colou?rScheme)"\s*:\s*"(light|dark|system|auto)"/i.test(localStorage.getItem(k) || "")))`;
const SET_DARK = (keys) => `(() => { try { for (const k of ${JSON.stringify(keys)}) { const v = localStorage.getItem(k);
  localStorage.setItem(k, v && v.startsWith("{") ? v.replace(/("(?:theme|mode|colou?rScheme)"\s*:\s*)"(light|system|auto)"/gi, '$1"dark"') : v && v.startsWith('"') ? '"dark"' : "dark"); } } catch { /* no storage */ } })()`;
const NOT_DARK = "dark not applied: the page stayed light under prefers-color-scheme dark and with its stored theme set to dark (it may keep the theme elsewhere, or have no dark mode); no dark shot taken";

// Chrome's own --screenshot can't do this: headless windows are at least 500px wide, so a 390 shot lays out at 500
// and crops the right edge. Drive the DevTools protocol over a pipe instead (no port, no WebSocket): the viewport
// is set exactly, as Playwright sets it.
async function chromeShots(exe, shots, fullPage) {
  const profile = mkdtempSync(join(tmpdir(), "wwjd-chrome-"));
  const proc = spawn(exe, ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--disable-gpu", "--hide-scrollbars",
    "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  let seq = 0, buf = "";
  const waiting = new Map(), listeners = new Set();
  proc.stdio[4].on("data", (chunk) => {
    buf += chunk.toString("utf8");
    for (let i; (i = buf.indexOf("\0")) >= 0; ) {
      const msg = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
      if (msg.id && waiting.has(msg.id)) { const { ok, ko } = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? ko(new Error(msg.error.message)) : ok(msg.result); }
      else for (const fn of listeners) fn(msg);
    }
  });
  const exited = new Promise((_, ko) => proc.on("exit", () => ko(new Error("Chrome exited"))));
  exited.catch(() => { /* raced below */ });
  const send = (method, params = {}, sessionId) => Promise.race([exited, new Promise((ok, ko) => {
    const id = ++seq; waiting.set(id, { ok, ko });
    proc.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0");
  })]);
  const event = (sessionId, method, ms) => new Promise((ok) => {
    const fn = (m) => { if (m.sessionId === sessionId && m.method === method) done(true); };
    const timer = setTimeout(() => done(false), ms);
    const done = (v) => { clearTimeout(timer); listeners.delete(fn); ok(v); };
    listeners.add(fn);
  });
  let failed = 0, notDark = 0;
  try {
    for (const { w, scheme, file } of shots) {
      try {
        const { targetId } = await send("Target.createTarget", { url: "about:blank" });
        const { sessionId: s } = await send("Target.attachToTarget", { targetId, flatten: true });
        await send("Page.enable", {}, s);
        await send("Emulation.setDeviceMetricsOverride", { width: w, height: H(w), deviceScaleFactor: 1, mobile: false }, s);
        await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }] }, s);
        const go = async () => {
          const loaded = event(s, "Page.loadEventFired", 30000);
          await send("Page.navigate", { url }, s);
          if (!(await loaded)) console.error(`render: ${url} did not finish loading at ${w}px; shooting what rendered`);
          await new Promise((ok) => setTimeout(ok, 500));
        };
        const evalValue = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true }, s)).result.value;
        await go();
        if (scheme === "dark" && (await evalValue(LUMA)) > 0.5) {
          const keys = [...new Set([...JSON.parse(await evalValue(STORED)), ...THEME_KEYS])];
          await send("Page.addScriptToEvaluateOnNewDocument", { source: SET_DARK(keys) }, s);
          await go();
          if ((await evalValue(LUMA)) > 0.5) { notDark++; console.error(`render: ${w}px ${NOT_DARK}`); await send("Target.closeTarget", { targetId }); continue; }
        }
        const { result: { value: [sw, sh] } } = await send("Runtime.evaluate", { expression: "[document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight]", returnByValue: true }, s);
        const height = fullPage ? Math.max(H(w), sh) : H(w);
        const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: fullPage, clip: { x: 0, y: 0, width: w, height, scale: 1 } }, s);
        writeFileSync(file, Buffer.from(data, "base64"));
        console.log(file + "  (system Chrome)" + (sw > 1 ? `  (scrolls sideways by ${sw}px)` : ""));
        await send("Target.closeTarget", { targetId });
      } catch (e) { failed++; console.error(`render: Chrome could not shoot ${w}px ${scheme}: ${e.message.split("\n")[0]}`); }
    }
    await send("Browser.close").catch(() => undefined);
  } finally {
    proc.kill();
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* left in tmp */ }
  }
  return { failed, notDark };
}
if (!chromium && cmd === "shoot") {
  const exe = systemChrome();
  if (exe) {
    mkdirSync(plan.out, { recursive: true });
    // a page that stays light is a finding, not a renderer that can't run: no UNAVAILABLE for it
    const { failed, notDark } = await chromeShots(exe, plan.shots, plan.fullPage);
    if (failed === plan.shots.length) unavailable(`render: system Chrome (${exe}) took no shot of ${target}`);
    process.exit(failed || notDark ? 1 : 0);
  }
}
if (!chromium) unavailable(`render needs Playwright: run node ${new URL(import.meta.url).pathname} setup once (or npm i -D playwright here)`);
// Playwright's own Chromium; when its build is missing (a playwright-core newer than the cached browsers), a Chrome
// on this machine.
let browser;
try { browser = await chromium.launch({ headless: true, executablePath: process.env.PW_EXE || undefined }); }
catch (e) {
  const exe = !process.env.PW_EXE && systemChrome();
  try { if (!exe) throw e; browser = await chromium.launch({ headless: true, executablePath: exe }); }
  catch { unavailable(`render: Playwright found no Chromium (${e.message.split("\n")[0]}); run npx playwright install chromium, or set PW_EXE`); }
}
const findings = [];
const add = (width, rule, severity, what) => findings.push({ width, rule, severity, what });

// Load, the fonts and the --wait-for element, then a short settle; no networkidle (a busy page never idles), no reload.
async function open(page, settle = 300) {
  let res = null;
  try { res = await page.goto(url, { waitUntil: "load", timeout: 30000 }); }
  catch (e) { console.error(`render: ${url} did not finish loading (${e.message.split("\n")[0]}); checking what rendered`); }
  if (res && res.status() >= 400) { console.error(`render: ${url} answered ${res.status()}${res.status() === 404 ? " (not found)" : ""}; nothing checked`); await browser.close(); process.exit(1); }
  if (waitFor) {
    try { await page.waitForSelector(waitFor, { state: "visible", timeout: 15000 }); }
    catch { console.error(`render: ${waitFor} never showed on ${url}; checking what rendered`); }
  }
  await page.evaluate(() => Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 3000))])).catch(() => {});
  await page.waitForTimeout(settle);
}

// The resting frame: finite animations jump to their end, endless ones pause where they are.
const settle = (page) => page.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.pause(); } } });

// ── shoot ──────────────────────────────────────────────────────────
if (cmd === "shoot") {
  mkdirSync(plan.out, { recursive: true });
  let failed = 0;
  for (const { w, scheme, file } of plan.shots) {
    let page = await browser.newPage({ viewport: { width: w, height: H(w) }, colorScheme: scheme });
    let errs = []; page.on("pageerror", (e) => errs.push(e.message));
    await open(page, 500);
    if (scheme === "dark" && (await page.evaluate(LUMA)) > 0.5) {
      const keys = [...new Set([...JSON.parse(await page.evaluate(STORED)), ...THEME_KEYS])];
      await page.close();
      page = await browser.newPage({ viewport: { width: w, height: H(w) }, colorScheme: scheme });
      errs = []; page.on("pageerror", (e) => errs.push(e.message));
      await page.addInitScript(SET_DARK(keys));
      await open(page, 500);
      if ((await page.evaluate(LUMA)) > 0.5) { failed++; console.error(`render: ${w}px ${NOT_DARK}`); await page.close(); continue; }
    }
    await page.screenshot({ path: file, fullPage: plan.fullPage });
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(file + (ox > 1 ? `  (scrolls sideways by ${ox}px)` : "") + (errs.length ? `  (page errors: ${errs.slice(0, 2).join(" | ")})` : ""));
    await page.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
}

// ── fit ────────────────────────────────────────────────────────────
if (cmd === "fit") {
  const widths = opt("--widths", "240,320,480,720").split(",").map(Number);
  const selector = opt("--selector", null);
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: selector ? 1280 : w, height: 900 }, reducedMotion: "reduce" });
    await open(page, 0);
    await settle(page);
    if (selector) await page.evaluate(([s, w]) => { const el = document.querySelector(s); if (el) { el.style.inlineSize = w + "px"; el.style.containerType = "inline-size"; } }, [selector, w]);
    await page.waitForTimeout(150);
    const r = await page.evaluate((sel) => {
      const out = [];
      const root = sel ? document.querySelector(sel) : document.documentElement;
      const lineH = (el) => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
      const name = (el) => (el.getAttribute("data-identifier") || el.textContent || "").trim().slice(0, 40);
      const label = (el) => (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30) || el.tagName.toLowerCase();
      const css = (el) => el.tagName.toLowerCase() + (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/)[0] : "");
      // Visually hidden on purpose (sr-only: a 1px box, clip rect(0 0 0 0), clip-path inset(50%)), itself or above.
      const srOnly = (el) => {
        for (let p = el; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
          const c = getComputedStyle(p), b = p.getBoundingClientRect();
          if ((b.width <= 1 && b.height <= 1) || ((b.width <= 1 || b.height <= 1) && c.overflow !== "visible")) return true;
          if (/inset\(\s*(50|100)%/.test(c.clipPath)) return true;
          if ((c.position === "absolute" || c.position === "fixed") && c.clip && c.clip !== "auto") {
            const n = (c.clip.match(/-?[\d.]+/g) || []).map(Number);
            if (n.length === 4 && (n[2] - n[0] <= 1 || n[1] - n[3] <= 1)) return true;
          }
        }
        return false;
      };
      // Faint counts as hidden: a placeholder at opacity 0.02 or a glyph mid-fade is not text anyone reads.
      const faint = (el) => { let o = 1; for (let p = el; p && p !== document.documentElement; p = p.parentElement) o *= parseFloat(getComputedStyle(p).opacity); return o < 0.1; };
      const shown = (el) => el.getClientRects().length && (el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) ?? true) && !srOnly(el) && !faint(el);
      // A text node's line fragments, trimmed to the line box: glyph ink past a tight line-height is not text.
      const textLines = (node) => {
        const r = document.createRange(); r.selectNodeContents(node);
        const L = lineH(node.parentElement);
        return [...r.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5).map((x) => {
          const cut = x.height > L ? (x.height - L) / 2 : 0;
          return { left: x.left, right: x.right, top: x.top + cut, bottom: x.bottom - cut };
        });
      };
      const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      for (const el of root.querySelectorAll("[data-identifier], h1, h2, h3, h4, h5, h6")) {
        if (!el.offsetParent && el.tagName !== "BODY") continue;
        if (srOnly(el)) continue;
        // Vertically, a box that doesn't clip only loses text when a whole line spills; glyph ink past a tight
        // line-height (scrollHeight a px or two over) is not a clip.
        const cs = getComputedStyle(el), spill = cs.overflowY === "visible" && cs.webkitLineClamp === "none" ? lineH(el) / 2 : 1;
        if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + spill) out.push(["identifier-clipped", "error", name(el)]);
        else if (el.getBoundingClientRect().height / lineH(el) > 3.5) out.push(["identifier-long", "warn", name(el)]);
      }
      // A wrapping flex row that left one child alone on a line, or a row holding one small item: a lone item.
      // Lines are items whose boxes share height, so a dot centred beside taller text sits on the text's line.
      const small = (b) => b.width < 56 && b.height < 56;
      const lines = (items) => {
        const ls = [];
        for (const it of [...items].sort((a, b) => a.b.top - b.b.top)) {
          const cur = ls.at(-1);
          if (cur && it.b.top < cur.bottom - 1) { cur.items.push(it); cur.bottom = Math.max(cur.bottom, it.b.bottom); }
          else ls.push({ items: [it], bottom: it.b.bottom });
        }
        return ls;
      };
      const orphanName = (k) => k.getAttribute("aria-label") || (typeof k.className === "string" && k.className) || k.tagName;
      let orphan = false;
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (!cs.display.includes("flex") || !el.getClientRects().length) continue;
        const kids = [...el.children].filter((k) => k.getClientRects().length && getComputedStyle(k).position !== "absolute");
        if (cs.flexWrap !== "nowrap" && cs.flexDirection.startsWith("row") && kids.length >= 2) {
          const ls = lines(kids.map((k) => ({ k, b: k.getBoundingClientRect() })));
          const box = el.getBoundingClientRect();
          // two items: only a small one (a dot after a title) counts; from three, also one pushed to the far side
          const lone = ls.slice(1).find((l) => l.items.length === 1 && (small(l.items[0].b) || (kids.length >= 3 && l.items[0].b.left - box.left > box.width * 0.4)));
          if (lone) { out.push(["orphan-item", "error", orphanName(lone.items[0].k) + " wrapped onto a line of its own"]); orphan = true; break; }
        }
      }
      // In running text: a small inline item (a status dot, an icon, a badge) that wrapped alone onto the last line.
      for (const el of orphan ? [] : root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (!cs.display.startsWith("inline") || el.ownerSVGElement || el.textContent.trim().length > 3 || !shown(el)) continue;
        const b = el.getBoundingClientRect();
        if (!small(b) || b.width < 2) continue;
        let block = el.parentElement;
        while (block && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
        // preformatted text breaks where it was written
        if (!block || (block.textContent || "").length > 1000 || /^pre|break-spaces/.test(getComputedStyle(block).whiteSpace)) continue;
        const rects = (range) => [...range.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5);
        const before = document.createRange(); before.setStart(block, 0); before.setEndBefore(el);
        const after = document.createRange(); after.setStartAfter(el); after.setEnd(block, block.childNodes.length);
        const prior = rects(before);
        if (!prior.length || !(before.toString().trim() || prior.length > 1)) continue;
        const sameLine = (x) => x.top < b.bottom - 1 && x.bottom > b.top + 1;
        if (!prior.some(sameLine) && !rects(after).some(sameLine) && prior.some((x) => x.bottom <= b.top + 1)) {
          out.push(["orphan-item", "error", orphanName(el) + " wrapped onto a line of its own"]); break;
        }
      }
      // A cell (one word, a checkbox) is laid out by its table or grid, never a lone row: skip it and what it holds.
      const CELL = "td, th, [role=cell], [role=gridcell], [role=columnheader], [role=rowheader], [role=row]";
      const inTable = (el) => {
        if (el.closest(CELL)) return true;
        for (let p = el; p && p !== document.body; p = p.parentElement) if (/table/.test(getComputedStyle(p).display)) return true;
        return false;
      };
      for (const el of root.querySelectorAll("*")) {
        const kids = [...el.children].filter((k) => k.getClientRects().length);
        const sib = el.parentElement ? [...el.parentElement.children].filter((k) => k.getClientRects().length) : [];
        if (kids.length !== 1 || sib.length < 2 || el.textContent.trim().length > 3 || !el.getClientRects().length || inTable(el)) continue;
        const b = kids[0].getBoundingClientRect(), row = el.getBoundingClientRect();
        if (b.width < 56 && row.width > b.width * 4 && b.height < 56) { out.push(["orphan-item", "error", (kids[0].getAttribute("aria-label") || kids[0].getAttribute("class") || kids[0].tagName) + " sits alone in its own row"]); break; }
      }
      // Text cut mid-line by an overflow clip (a fixed-height excerpt whose third line shows half). Scrollers scroll,
      // line-clamp cuts at a line and a mask fades on purpose; sr-only text is meant to be clipped.
      const textBlocks = [...root.querySelectorAll("*")].filter((el) => ownText(el).length).slice(0, 3000);
      sliced: for (const el of textBlocks) {
        if (!shown(el)) continue;
        for (let p = el; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
          const c = getComputedStyle(p);
          if (c.overflowY === "visible") continue;
          if ((c.overflowY !== "hidden" && c.overflowY !== "clip") || c.webkitLineClamp !== "none" || (c.maskImage && c.maskImage !== "none") || (c.webkitMaskImage && c.webkitMaskImage !== "none")) break;
          const pb = p.getBoundingClientRect(), edge = pb.bottom - parseFloat(c.borderBottomWidth || 0);
          for (const t of ownText(el)) for (const x of textLines(t)) {
            const h = x.bottom - x.top;
            if (x.top < edge - h * 0.25 && x.bottom > edge + h * 0.25) {
              out.push(["text-sliced", "error", `"${label(el)}" cut mid-line by ${css(p)} (${Math.round(pb.height)}px tall)`]);
              break sliced;
            }
          }
          break;
        }
      }
      // Text or a control drawn over another it is not nested in (a toolbar positioned over the headline). Overlays
      // that float on purpose are skipped: fixed or sticky, dialogs, popovers, menus, tooltips, toasts; also
      // pointer-events none, aria-hidden and sr-only, and adornments inside a field (a clear button, a floating label).
      const CONTROL = "button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=radio], [role=checkbox], [role=switch], [role=link], [role=menuitem], [role=option]";
      const FLOAT = "dialog, [popover], [role=dialog], [role=alertdialog], [role=tooltip], [role=menu], [role=listbox], [role=status], [role=alert], [aria-modal=true], [aria-hidden=true]";
      const floats = (el) => { for (let p = el; p && p !== document.documentElement; p = p.parentElement) { if (p.matches(FLOAT)) return true; const pos = getComputedStyle(p).position; if (pos === "fixed" || pos === "sticky") return true; } return false; };
      const clipMemo = new Map();
      const clipOf = (el) => {
        if (!el || el === document.documentElement || el === document.body) return { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 };
        if (clipMemo.has(el)) return clipMemo.get(el);
        const up = clipOf(el.parentElement), c = getComputedStyle(el.parentElement || el);
        let r = up;
        if (el.parentElement && el.parentElement !== document.body && el.parentElement !== document.documentElement) {
          const pb = el.parentElement.getBoundingClientRect();
          r = { left: c.overflowX !== "visible" ? Math.max(up.left, pb.left) : up.left, right: c.overflowX !== "visible" ? Math.min(up.right, pb.right) : up.right,
            top: c.overflowY !== "visible" ? Math.max(up.top, pb.top) : up.top, bottom: c.overflowY !== "visible" ? Math.min(up.bottom, pb.bottom) : up.bottom };
        }
        clipMemo.set(el, r); return r;
      };
      const clipTo = (x, k) => ({ left: Math.max(x.left, k.left), right: Math.min(x.right, k.right), top: Math.max(x.top, k.top), bottom: Math.min(x.bottom, k.bottom) });
      const items = [];
      for (const el of [...root.querySelectorAll("*")].slice(0, 6000)) {
        const control = el.matches(CONTROL), text = ownText(el);
        if ((!control && !text.length) || !shown(el) || getComputedStyle(el).pointerEvents === "none" || floats(el)) continue;
        // text is clipped by its own box too (a td with overflow hidden and an ellipsis)
        const own = getComputedStyle(el), eb = el.getBoundingClientRect(), up = clipOf(el);
        const k = control ? up : clipTo(up, { left: own.overflowX !== "visible" ? eb.left : -1e9, right: own.overflowX !== "visible" ? eb.right : 1e9,
          top: own.overflowY !== "visible" ? eb.top : -1e9, bottom: own.overflowY !== "visible" ? eb.bottom : 1e9 });
        const boxes = control ? [eb] : text.flatMap(textLines);
        for (const x of boxes) { const v = clipTo(x, k); if (v.right - v.left > 1 && v.bottom - v.top > 1) items.push({ el, control, ...v }); }
        if (items.length > 4000) break;
      }
      items.sort((a, b) => a.top - b.top);
      const FIELD = "input, select, textarea";
      const inside = (a, b) => a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
      overlap: for (let i = 0; i < items.length; i++) {
        const a = items[i];
        for (let j = i + 1; j < items.length && items[j].top < a.bottom; j++) {
          const b = items[j];
          if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const iw = Math.min(a.right, b.right) - Math.max(a.left, b.left), ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (iw <= 4 || ih <= Math.max(2, Math.min(a.bottom - a.top, b.bottom - b.top) * 0.3)) continue;
          if ((a.el.matches(FIELD) && inside(b, a)) || (b.el.matches(FIELD) && inside(a, b))) continue;
          if ((a.el.tagName === "LABEL" && a.el.control === b.el) || (b.el.tagName === "LABEL" && b.el.control === a.el)) continue;
          out.push(["overlap", "error", `"${label(a.el)}" (${css(a.el)}) and "${label(b.el)}" (${css(b.el)}) are drawn over each other`]);
          break overlap;
        }
      }
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if ((cs.clipPath && cs.clipPath !== "none" || cs.maskImage && cs.maskImage !== "none") && el.children.length) {
          const b = el.getBoundingClientRect();
          if (b.width < 1 || b.height < 1) { out.push(["value-fill-empty", "error", (el.closest("[aria-label],[role]")?.getAttribute("aria-label") || el.getAttribute("class") || el.tagName) + " has no box, so its fill shows nothing"]); break; }
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
        if (bad) { out.push(["control-height-mismatch", "error", (p.getAttribute("class") || p.tagName) + ": " + bad.map((h) => Math.round(h)).join(" vs ") + "px"]); break; }
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
        // a control scrolled out of its scroller's view is not clipped; bring it to the middle first, so only an
        // edge that stays in the way (padding too thin, the end of the scroll) reads as a cut ring
        el.scrollIntoView({ block: "center", inline: "center" });
        const r = el.getBoundingClientRect();
        for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
          const pc = getComputedStyle(p);
          if (pc.overflowX === "visible" && pc.overflowY === "visible") continue;
          const pr = p.getBoundingClientRect();
          if (r.left - ring < pr.left - 0.5 || r.right + ring > pr.right + 0.5 || r.top - ring < pr.top - 0.5 || r.bottom + ring > pr.bottom + 0.5)
            return (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40) + " inside " + p.tagName.toLowerCase() + (p.getAttribute("class") ? "." + p.getAttribute("class").split(" ")[0] : "");
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

// hovering the first rows must not move their siblings; a sibling that hover removes or adds is not compared
async function hoverShift(page, selector) {
  const rows = await page.$$(`${selector ? selector + " " : ""}:is([data-row], [role=row], li, tr)`);
  for (const row of rows.slice(0, 5)) {
    if (!(await row.isVisible())) continue;
    // hover() scrolls the row into view; scroll first so the scroll itself never reads as a shift
    try { await row.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch { continue; }
    const took = await page.evaluate((row) => {
      if (!row.parentElement) return false;
      window.__wwjdBoxes = new Map([...row.parentElement.children].map((c) => { const b = c.getBoundingClientRect(); return [c, [b.x, b.y, b.width, b.height]]; }));
      return true;
    }, row);
    if (!took) continue;
    try { await row.hover({ timeout: 2000 }); } catch { continue; }
    await page.waitForTimeout(160);
    const moved = await page.evaluate(() => {
      for (const [c, b] of window.__wwjdBoxes || []) {
        if (!c.isConnected) continue;
        const n = c.getBoundingClientRect();
        if ([n.x, n.y, n.width, n.height].some((v, j) => Math.abs(v - b[j]) > 0.5)) return true;
      }
      return false;
    });
    if (moved) return true;
  }
  return false;
}

// ── runtime ────────────────────────────────────────────────────────
if (cmd === "runtime") {
  const widths = opt("--widths", "320,390,768,1440,1920").split(",").map(Number);
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: H(w) }, reducedMotion: "reduce" });
    await open(page, 300);
    await settle(page);
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
        if (b.width <= 1 || b.height <= 1 || b.right <= 0 || b.bottom <= 0 || /inset\(\s*(50|100)%|rect\(0/.test(getComputedStyle(el).clipPath + getComputedStyle(el).clip)) return false; // hidden until focused (a skip link)
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
        if (hole) { out.push(["target-hole", "error", `${(hole.getAttribute("class") || hole.tagName).split(" ")[0]} sits above the stretched link: text cursor, hover drops`]); break; }
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
  await open(page, 300);
  const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getKeyframes?.().some((k) => k.transform || k.translate || k.scale || k.rotate)).length);
  if (moving) add(1440, "reduced-motion", "error", `${moving} transform animations still run under prefers-reduced-motion`);
  await page.close();
  finish(`runtime ${widths.join("/")}px`);
}

function finish(label) {
  const errors = findings.filter((f) => f.severity === "error").length;
  const report = { url: target, errors, findings };
  // The reports the Strictness gate (gate.mjs) reads: fit.json from 3, runtime.json from 4.
  if (cmd === "runtime" || cmd === "fit") { try { mkdirSync(join(ROOT, ".wwjd"), { recursive: true }); writeFileSync(join(ROOT, ".wwjd", `${cmd}.json`), JSON.stringify(report, null, 2)); } catch { /* read-only */ } }
  if (json) console.log(JSON.stringify(report, null, 2));
  else { for (const f of findings) console.log(`${String(f.width).padStart(4)}px  ${f.severity === "error" ? "ERROR" : "warn "} ${f.rule}: ${f.what}`); console.log(`\nrender ${label}: ${errors} errors, ${findings.length - errors} warnings`); }
  browser.close().then(() => process.exit(errors ? 1 : 0));
}
