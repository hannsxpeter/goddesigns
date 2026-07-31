#!/usr/bin/env node
// goddesign token extraction: measure an existing design system instead of eyeballing it.
//
// Why this exists: Step 0 item 1 sends a repo that already has a design system into
// extension mode, where the job is faithful extension and the QA gate compares the
// render against "the existing system's tokens". Until now nothing produced that list,
// so the model inferred it by reading around, which is exactly the "use gray" failure
// the skill bans everywhere else. This script reads the values.
//
// It also serves the genome lane: CONTRIBUTING's extraction recipe asks for a type
// system, palette, radius, and spacing as values. Point this at a cloned site or a
// local build and the measured half arrives as JSON.
//
// Sources, in order of authority: W3C design-token JSON files (including the
// tokens/*.json that skillui emits), CSS custom properties in :root / @theme,
// Tailwind config theme values, then raw @font-face and @import declarations.
//
// Usage:
//   node extract-tokens.mjs <dir-or-file> [...] [--json] [--out baseline.json]
//
// Exit codes: 0 = tokens found, 2 = nothing extractable.

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, relative, resolve, basename } from 'node:path';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
let outPath = null;
const targets = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') continue;
  if (a === '--out') { outPath = argv[++i]; continue; }
  if (a.startsWith('--out=')) { outPath = a.slice(6); continue; }
  if (a.startsWith('--')) { console.error(`extract-tokens: unknown flag ${a}`); process.exit(2); }
  targets.push(a);
}
if (!targets.length) {
  console.error('usage: node extract-tokens.mjs <dir-or-file> [...] [--json] [--out baseline.json]');
  process.exit(2);
}

const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', '.svelte-kit', 'vendor']);
const WANT_EXT = new Set(['.css', '.scss', '.sass', '.less', '.pcss', '.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.mjs', '.cjs', '.vue', '.svelte', '.astro', '.json']);

function collect(target, out) {
  let st;
  try { st = statSync(target); } catch { return; }
  if (st.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (SKIP_DIR.has(entry) || (entry.startsWith('.') && entry !== '.')) continue;
      collect(join(target, entry), out);
    }
    return;
  }
  const ext = extname(target).toLowerCase();
  if (!WANT_EXT.has(ext)) return;
  // Only look at JSON that plausibly holds tokens; package-lock.json is noise.
  if (ext === '.json' && !/token|theme|design|palette|color/i.test(basename(target))) return;
  out.push(target);
}

const files = [];
for (const t of targets) collect(t, files);

// ---------------------------------------------------------------- accumulators

const vars = new Map();      // --name -> value (first definition wins)
const hexes = new Map();     // hex -> occurrence count
const fonts = new Map();     // family -> occurrence count
const radii = new Map();     // value -> count
const spacing = new Map();   // px number -> count
const imports = new Set();   // font import URLs and @font-face families
const sources = new Set();

const bump = (map, key, by = 1) => { if (key === undefined || key === null || key === '') return; map.set(key, (map.get(key) || 0) + by); };
// A hex literal, not an HTML numeric entity (&#8594;) and not a longer run.
const HEX = /(?<!&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi;
const hexes_ = (s) => String(s).match(new RegExp(HEX.source, 'gi'));
const stripDataURIs = (s) => s.replace(/data:[a-z0-9+/.-]+;base64,[A-Za-z0-9+/=\s]+/gi, 'data:stripped');
const GENERIC_FAMILY = /^(system-ui|-apple-system|blinkmacsystemfont|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|sans-serif|serif|monospace|cursive|fantasy|inherit|initial|unset|revert|var\(|emoji|math|fangsong)/i;
const normHex = (h) => {
  let v = h.toLowerCase();
  if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  if (v.length === 9) v = v.slice(0, 7); // drop alpha for identity purposes
  return v;
};
const firstFamily = (value) => (String(value).split(',')[0] || '').trim().replace(/^["']|["']$/g, '');

// Type hides behind project-named custom properties (--display, --body), not only
// behind --font-*. Recognize a type slot by name or by a value that reads as a stack.
const FONT_SLOT_NAME = /^--(font[\w-]*|ff|type|typeface|display|body|heading|head|title|serif|sans|mono|numerals?|code|tabular|spec)$/i;
const isFontValue = (v) => /^\s*["']?[A-Za-z]/.test(v) && !/^\s*(var|oklch|rgb|hsl|hwb|lab|lch|color|calc|url|clamp|min|max)\s*\(/i.test(v) && !/^\s*#/.test(v);
const looksLikeFontStack = (v) => /,\s*[\w -]*(serif|sans-serif|monospace|cursive|fantasy|system-ui)\s*$/i.test(String(v).trim());

// ---------------------------------------------------------------- W3C / skillui token JSON

function walkTokens(node, path = []) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => walkTokens(n, path)); return; }
  const value = node.$value !== undefined ? node.$value : node.value;
  if (typeof value === 'string') {
    const name = path[path.length - 1] || '';
    const role = node.role || name;
    // Classify by the whole path, not the leaf: a design-token file nests the kind
    // above the slot (fontFamily.display, color.background, radius.md), so a leaf
    // named "display" only means type because "fontFamily" sits above it.
    const kind = [...path, node.role || ''].join('.');
    const h0 = hexes_(value);
    if (h0) { bump(hexes, normHex(h0[0]), 3); if (role) vars.set(`--${String(role).replace(/[^\w-]/g, '-')}`, value); }
    if (/font|family|typeface/i.test(kind) && !/size|weight|height/i.test(kind)) {
      const fam = firstFamily(value);
      if (fam && !GENERIC_FAMILY.test(fam)) bump(fonts, fam, 3);
    }
    if (/radius|rounded/i.test(kind)) bump(radii, value.trim(), 3);
    if (/spac|gap|size/i.test(kind) && /^\d+(\.\d+)?(px|rem)$/.test(value.trim())) {
      const n = value.trim().endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value);
      bump(spacing, n, 3);
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') && k !== '$value') continue;
    walkTokens(v, [...path, k]);
  }
}

// ---------------------------------------------------------------- scan

for (const file of files) {
  let text;
  try { text = stripDataURIs(readFileSync(file, 'utf8')); } catch { continue; }
  const ext = extname(file).toLowerCase();
  const rel = relative(process.cwd(), resolve(file)) || file;

  if (ext === '.json') {
    try { walkTokens(JSON.parse(text)); sources.add(rel); } catch { /* not a token file */ }
    continue;
  }

  let touched = false;

  // CSS custom properties, wherever they are declared.
  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;}\n]+)/g)) {
    const name = m[1], value = m[2].trim();
    if (!vars.has(name)) vars.set(name, value);
    touched = true;
    const h = hexes_(value);
    if (h) h.forEach((x) => bump(hexes, normHex(x), 2));
    if (!/size|weight|height|spacing|tracking/i.test(name)
      && ((FONT_SLOT_NAME.test(name) && isFontValue(value)) || looksLikeFontStack(value))) {
      const fam = firstFamily(value);
      if (fam && !GENERIC_FAMILY.test(fam)) bump(fonts, fam, 2);
    }
    if (/radius|rounded/i.test(name)) bump(radii, value, 2);
    if (/^--(space|spacing|gap|size|step|sp|s)-?\d*$|^--(space|spacing|gap|size|step)/i.test(name) && /^\d+(\.\d+)?(px|rem)$/.test(value)) {
      bump(spacing, value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value), 2);
    }
  }

  // Raw declarations.
  for (const m of text.matchAll(/font-family\s*:\s*([^;}\n]+)/gi)) {
    const fam = firstFamily(m[1]);
    if (fam && !GENERIC_FAMILY.test(fam)) { bump(fonts, fam); touched = true; }
  }
  for (const m of text.matchAll(/border-radius\s*:\s*([^;}\n]+)/gi)) { bump(radii, m[1].trim()); touched = true; }
  for (const m of text.matchAll(/(?:padding|margin|gap)(?:-\w+)?\s*:\s*([^;}\n]+)/gi)) {
    for (const v of m[1].matchAll(/(\d+(?:\.\d+)?)(px|rem)/g)) {
      bump(spacing, v[2] === 'rem' ? parseFloat(v[1]) * 16 : parseFloat(v[1]));
      touched = true;
    }
  }
  const raw = hexes_(text);
  if (raw) { raw.forEach((x) => bump(hexes, normHex(x))); touched = true; }

  // Font delivery.
  for (const m of text.matchAll(/@import\s+url\(([^)]*fonts[^)]*)\)/gi)) { imports.add(m[1].replace(/["']/g, '')); touched = true; }
  for (const m of text.matchAll(/https?:\/\/fonts\.(?:googleapis|bunny|gstatic)\.[a-z]+\/[^\s"'<>)]+/gi)) { imports.add(m[0]); touched = true; }
  for (const m of text.matchAll(/@font-face\s*\{[^}]*font-family\s*:\s*([^;}\n]+)/gi)) {
    const fam = firstFamily(m[1]);
    if (fam) { bump(fonts, fam, 2); imports.add(`@font-face ${fam}`); touched = true; }
  }

  // Tailwind config: theme values are literals in a JS object, so read them as text.
  if (/tailwind\.config\./i.test(rel) || /@theme\b/.test(text)) {
    for (const m of text.matchAll(/fontFamily\s*:\s*\{([\s\S]{0,600}?)\}/g)) {
      for (const q of m[1].matchAll(/["']([A-Z][\w .-]+)["']/g)) bump(fonts, q[1], 2);
    }
    touched = true;
  }

  if (touched) sources.add(rel);
}

// ---------------------------------------------------------------- role inference

const ROLE_PATTERNS = [
  ['bg', /^--(bg|background|page|paper|canvas|base)\b|^--color-(bg|background)/i],
  ['surface', /^--(surface|card|panel|elevated|layer)\b|^--color-(surface|card)/i],
  ['text', /^--(text|fg|foreground|ink|body-color|content)\b|^--color-(text|foreground)/i],
  ['muted', /^--(muted|subtle|secondary-text|dim|faint)\b|^--color-muted/i],
  ['accent', /^--(accent|primary|brand|highlight)\b|^--color-(accent|primary|brand)/i],
  ['border', /^--(border|rule|line|stroke|divider)\b|^--color-border/i],
];

const roles = {};
for (const [role, re] of ROLE_PATTERNS) {
  for (const [name, value] of vars) {
    if (!re.test(name)) continue;
    const h = hexes_(value);
    if (!h) continue;
    roles[role] = { token: name, value: normHex(h[0]) };
    break;
  }
}

const topFonts = [...fonts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
const topHexes = [...hexes.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
const topRadii = [...radii.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
const spacingScale = [...spacing.keys()].sort((a, b) => a - b);

const found = topHexes.length + topFonts.length + vars.size;
if (!files.length || !found) {
  console.error('NO DESIGN SYSTEM FOUND: no custom properties, token files, or color literals under the given targets.');
  console.error('Treat this as a greenfield run: roll the seed and take the full path (SKILL.md Step 1 onward).');
  process.exit(2);
}

const baseline = {
  extracted: new Date().toISOString().slice(0, 10),
  targets,
  sources: [...sources].sort(),
  roles,
  fonts: topFonts,
  hexes: topHexes,
  radius: topRadii,
  spacing: spacingScale,
  imports: [...imports].sort(),
  customProperties: Object.fromEntries([...vars].slice(0, 200)),
};

if (outPath) writeFileSync(outPath, JSON.stringify(baseline, null, 2));

if (asJson) {
  console.log(JSON.stringify(baseline, null, 1));
} else {
  const lockLine = ['bg', 'surface', 'text', 'muted', 'accent']
    .map((r) => `--${r} ${roles[r] ? roles[r].value : '?'}`)
    .join(' | ');
  console.log(`goddesign token baseline: ${files.length} file(s) read, ${sources.size} carried tokens`);
  console.log(`Tokens: ${lockLine}`);
  console.log(`Type: ${topFonts.slice(0, 3).join(' / ') || '(none declared; the system uses system fonts)'}`);
  console.log(`Radius: ${topRadii.slice(0, 4).join(', ') || '(none)'}`);
  console.log(`Spacing observed (px): ${spacingScale.slice(0, 16).join(', ') || '(none)'}`);
  console.log(`Delivery: ${[...imports].slice(0, 3).join(' | ') || '(no webfont import found)'}`);
  console.log(`Palette (by frequency): ${topHexes.slice(0, 10).join(' ')}`);
  const missing = ['bg', 'surface', 'text', 'muted', 'accent'].filter((r) => !roles[r]);
  if (missing.length) console.log(`\nUnresolved roles: ${missing.join(', ')}. Name them from the palette above before locking; do not leave one as an adjective.`);
  if (outPath) console.log(`\nbaseline written to ${outPath}  (feed it back with: node sweep.mjs <build> --tokens ${outPath})`);
  else console.log('\nRe-run with --out baseline.json to feed this into: node sweep.mjs <build> --tokens baseline.json');
}

process.exit(0);
