#!/usr/bin/env node
// goddesign Phase 3 audit: measures what eyeballing misses.
// Usage: node audit.mjs <path-or-http-url> [more targets ...]
// Exit codes: 0 = green, 1 = named failures found, 2 = playwright lib unavailable (fall back to the screenshot chain).
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

async function loadPlaywright() {
  const candidates = ['playwright', 'playwright-core'];
  for (const c of candidates) {
    try { return await import(c); } catch {}
  }
  const roots = [];
  try { roots.push(execSync('npm root -g', { encoding: 'utf8' }).trim()); } catch {}
  roots.push('/opt/homebrew/lib/node_modules', '/usr/local/lib/node_modules',
    `${process.env.HOME}/.local/lib/node_modules`, `${process.env.HOME}/.npm-global/lib/node_modules`);
  for (const r of roots) {
    for (const name of candidates) {
      for (const entry of ['index.mjs', 'index.js']) {
        const p = `${r}/${name}/${entry}`;
        if (existsSync(p)) { try { return await import(pathToFileURL(p).href); } catch {} }
      }
    }
  }
  return null;
}

const pw = await loadPlaywright();
if (!pw) {
  console.error('AUDIT UNAVAILABLE: playwright library not importable. Enable with: npm i -g playwright  (then: npx playwright install chromium). Fall back to the screenshot chain in checklist.md.');
  process.exit(2);
}

const targets = process.argv.slice(2);
if (!targets.length) { console.error('usage: node audit.mjs <index.html-or-http-url> [...]'); process.exit(2); }
const VIEWPORTS = [{ w: 375, h: 812 }, { w: 768, h: 1024 }, { w: 1280, h: 900 }];

const IN_PAGE = () => {
  const effOpacity = (el) => {
    let o = 1, n = el;
    for (let i = 0; n && n !== document.documentElement && i < 8; i++, n = n.parentElement) {
      const cs = getComputedStyle(n);
      o *= parseFloat(cs.opacity);
      if (cs.visibility === 'hidden' || cs.display === 'none') return 0;
    }
    return o;
  };
  const label = (el) => `${el.tagName.toLowerCase()}"${(el.textContent || '').trim().slice(0, 24)}"`;
  const textSel = 'h1,h2,h3,h4,h5,h6,p,a,button,li,dt,dd,td,th,label,blockquote,figcaption,summary';

  // 1. horizontal overflow
  const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;

  // 2. hidden text (the reveal bug): visible-position elements with real text at effective opacity 0
  const hiddenText = [];
  for (const el of document.querySelectorAll(textSel)) {
    const t = (el.textContent || '').trim();
    if (t.length < 20) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (effOpacity(el) === 0) { hiddenText.push(label(el)); if (hiddenText.length >= 10) break; }
  }

  // 3. text-on-text collisions (ancestor pairs excluded). Scan ANY element carrying
  // a direct text node, not just classic text tags: labels in divs/spans collide too.
  const directText = (el) => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
  const els = [...document.body.querySelectorAll('*')]
    .filter(el => directText(el) && effOpacity(el) > 0.05 && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName))
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(x => x.r.width > 4 && x.r.height > 4)
    .slice(0, 600);
  const overlaps = [];
  for (let i = 0; i < els.length && overlaps.length < 10; i++) {
    for (let j = i + 1; j < els.length && overlaps.length < 10; j++) {
      const a = els[i], b = els[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ix > 6 && iy > 6) overlaps.push(`${label(a.el)} x ${label(b.el)}`);
    }
  }

  // 4. small interactive targets (report; gate applies 24px floor, 44px mobile)
  const smallTargets = [];
  for (const el of document.querySelectorAll('a,button,[role="button"],input,select,summary')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || effOpacity(el) === 0) continue;
    if (r.height < 24 || r.width < 24) { smallTargets.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`); if (smallTargets.length >= 10) break; }
  }

  // 5. webfont reality: computed first-choice family vs actually-loaded families
  const loaded = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')))];
  const first = (el) => (getComputedStyle(el).fontFamily || '').split(',')[0].trim().replace(/"/g, '');
  const h1 = document.querySelector('h1'), body = document.body;
  const generic = ['system-ui', '-apple-system', 'serif', 'sans-serif', 'monospace', 'Georgia', 'Arial', 'Helvetica'];
  const fontIssues = [];
  for (const [name, el] of [['h1', h1], ['body', body]]) {
    if (!el) continue;
    const fam = first(el);
    if (fam && !generic.includes(fam) && !loaded.includes(fam)) fontIssues.push(`${name} wants "${fam}" but it never loaded (falling back silently)`);
  }
  return { overflowX, hiddenText, overlaps, smallTargets, loadedFonts: loaded, fontIssues };
};

let browser;
try {
  browser = await pw.chromium.launch();
} catch (e) {
  console.error(`AUDIT UNAVAILABLE: browser launch failed (${String(e).split('\n')[0]}). A sandbox may be blocking browser spawn. Fall back to the screenshot chain in checklist.md, or hand the audit command to an operator outside the sandbox.`);
  process.exit(2);
}
const results = [];
let failures = 0;
for (const target of targets) {
  const url = /^https?:\/\//i.test(target)
    ? target
    : pathToFileURL(resolve(target)).href;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto(url, { waitUntil: 'load' });
    try { await page.evaluate(() => document.fonts.ready); } catch {}
    await page.waitForTimeout(1700); // past the 1500ms reveal-timeout guard; unguarded reveals stay hidden and get caught
    const r = await page.evaluate(IN_PAGE);
    r.file = target; r.viewport = `${vp.w}x${vp.h}`;
    const fail = r.overflowX || r.hiddenText.length || r.overlaps.length || r.fontIssues.length || (vp.w === 375 && r.smallTargets.length);
    if (fail) failures++;
    results.push(r);
    await page.screenshot({ path: `audit-${vp.w}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify({ failures, results }, null, 1));
process.exit(failures ? 1 : 0);
