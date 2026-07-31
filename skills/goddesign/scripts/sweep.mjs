#!/usr/bin/env node
// goddesign Phase 2a sweep: the greppable half of the QA gate, executed by a script
// instead of by the model that wrote the code.
//
// Why this exists: until now the only mechanical gate was scripts/audit.mjs, which
// needs Playwright and a browser. In a sandbox it exits 2, and the whole pass/fail
// gate collapses to model self-report. This script reads source only: no browser, no
// network, no model, no dependencies. It runs where the audit cannot.
//
// It does not replace Phase 2. It executes the assertions that resolve to a string,
// a number, or a count, and leaves the rest to the checklist.
//
// Usage:
//   node sweep.mjs <file-or-dir> [more targets ...] [--tokens baseline.json] [--json]
//   node sweep.mjs --rules            print the rule table and exit 0
//
// Waiver: any comment in a scanned file, in any comment syntax:
//   /* goddesign-allow: metallic-premium the Art Deco row states brass */
// File-scoped, and the reason is mandatory (8 characters or more). A waiver without
// a reason is itself reported, so the escape hatch cannot be used silently.
//
// Exit codes: 0 = no failures, 1 = named failures, 2 = nothing scannable / bad usage.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

// ---------------------------------------------------------------- rule table

const RULES = [
  // id, severity, one-line statement of the defect
  ['banned-font', 'fail', 'Inter, Roboto, Arial, Open Sans, Lato, or Poppins as a chosen face'],
  ['mono-body', 'fail', 'a monospace face set as body or display type'],
  ['space-grotesk', 'advisory', 'Space Grotesk present; legal as body only under fonts.md pairing 6'],
  ['no-webfont', 'fail', 'a named non-system face is used but nothing imports or declares it'],
  ['banned-hex', 'fail', 'the indigo-violet gradient family (#6366F1, #7C3AED, #8B5CF6)'],
  ['gradient-text', 'fail', 'gradient text via background-clip'],
  ['metallic-premium', 'fail', 'gold, brass, or bronze as premium shorthand'],
  ['pure-base', 'fail', 'pure #000 or #FFF as a page or surface base'],
  ['untinted-neutral', 'fail', 'an achromatic neutral token (R == G == B); neutrals carry chroma'],
  ['hex-outside-root', 'fail', 'a color literal in a component rule instead of a :root token'],
  ['transition-all', 'fail', 'transition: all'],
  ['important', 'fail', '!important outside the prefers-reduced-motion kill switch'],
  ['inline-style', 'fail', 'a style attribute in markup or a style prop in JSX'],
  ['accent-stripe', 'fail', 'a colored side border 3px or wider used as an accent stripe'],
  ['hr-divider', 'fail', 'an <hr> divider between sections'],
  ['chapter-cadence', 'fail', 'numbered chapter cadence: three or more 01/02/03 section labels'],
  ['metronome-padding', 'fail', 'one global section padding, or fewer than 3 distinct section paddings'],
  ['padding-ratio', 'fail', 'largest section padding under 2x the smallest'],
  ['reveal-cascade', 'fail', 'content at opacity 0 behind an observer with no js guard and no timeout'],
  ['no-focus-visible', 'fail', 'interactive elements ship with no :focus-visible rule'],
  ['no-reduced-motion', 'fail', 'motion ships with no prefers-reduced-motion block'],
  ['buzzword', 'fail', 'weightless marketing copy (unleash, elevate, seamless, next-gen)'],
  ['dash-in-copy', 'fail', 'an em dash or en dash in UI copy'],
  ['no-stamp', 'fail', 'the stylesheet carries no /* goddesign | ... */ stamp'],
  ['token-drift', 'fail', 'a value outside the supplied token baseline (--tokens mode only)'],
  ['off-scale-spacing', 'advisory', 'a px spacing value off the token scale'],
  ['ornament-kit', 'advisory', 'more than one item from the stock ornament kit'],
  ['markup-color', 'advisory', 'a color literal in a markup attribute'],
  ['waiver-without-reason', 'fail', 'a goddesign-allow comment with no stated reason'],
];

const SEVERITY = Object.fromEntries(RULES.map(([id, sev]) => [id, sev]));

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
if (argv.includes('--rules')) {
  const w = Math.max(...RULES.map((r) => r[0].length));
  for (const [id, sev, text] of RULES) console.log(`${id.padEnd(w)}  ${sev.padEnd(8)}  ${text}`);
  process.exit(0);
}

const asJson = argv.includes('--json');
let baselinePath = null;
const targets = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') continue;
  if (a === '--tokens') { baselinePath = argv[++i]; continue; }
  if (a.startsWith('--tokens=')) { baselinePath = a.slice(9); continue; }
  if (a.startsWith('--')) { console.error(`sweep: unknown flag ${a}`); process.exit(2); }
  targets.push(a);
}
if (!targets.length) {
  console.error('usage: node sweep.mjs <file-or-dir> [...] [--tokens baseline.json] [--json]');
  console.error('       node sweep.mjs --rules');
  process.exit(2);
}

let baseline = null;
if (baselinePath) {
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  } catch (e) {
    console.error(`sweep: cannot read token baseline ${baselinePath} (${String(e.message)}).`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------- collection

const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
const MARKUP_EXT = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.js', '.ts', '.mjs']);
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', '.svelte-kit', 'vendor', '.playwright-cli', '.playwright-mcp']);

function collect(target, out) {
  let st;
  try { st = statSync(target); } catch { return; }
  if (st.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (SKIP_DIR.has(entry) || entry.startsWith('.') && entry !== '.') continue;
      collect(join(target, entry), out);
    }
    return;
  }
  const ext = extname(target).toLowerCase();
  if (STYLE_EXT.has(ext) || MARKUP_EXT.has(ext)) out.push(target);
}

const files = [];
for (const t of targets) collect(t, files);
if (!files.length) {
  console.error('SWEEP UNAVAILABLE: no .html/.css/.jsx/.tsx/.vue/.svelte/.astro files under the given targets.');
  process.exit(2);
}

// ---------------------------------------------------------------- findings

const findings = [];
const add = (rule, file, line, detail) => {
  findings.push({ rule, severity: SEVERITY[rule], file, line, detail });
};
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// ---------------------------------------------------------------- helpers

// Pull CSS out of a file: whole file for stylesheets, <style> blocks and
// styled-template literals for markup.
function cssOf(text, ext) {
  if (STYLE_EXT.has(ext)) return [{ css: text, offset: 0 }];
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text))) blocks.push({ css: m[1], offset: m.index + m[0].indexOf(m[1]) });
  return blocks;
}

// Split a CSS string into { selector, body, index } declaration blocks. Nested
// at-rules (@media, @supports, @layer) are walked so their inner rules are seen
// with the at-rule recorded as context.
function rulesOf(css) {
  const out = [];
  let depth = 0, selStart = 0, i = 0;
  const stack = [];
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') { const end = css.indexOf('*/', i); i = end === -1 ? css.length : end + 2; continue; }
    if (ch === '{') {
      // Comments sit between rules, so the raw slice carries the previous rule's
      // trailing comment. Strip them or ":root" reads as a comment and every token
      // in it gets reported as a component-rule literal.
      const selector = css.slice(selStart, i).replace(/\/\*[\s\S]*?\*\//g, ' ').trim();
      if (selector.startsWith('@')) { stack.push(selector); depth++; i++; selStart = i; continue; }
      let end = i + 1, inner = 1;
      while (end < css.length && inner > 0) {
        if (css[end] === '/' && css[end + 1] === '*') { const e2 = css.indexOf('*/', end); end = e2 === -1 ? css.length : e2 + 2; continue; }
        if (css[end] === '{') inner++;
        else if (css[end] === '}') inner--;
        end++;
      }
      const lead = css.slice(selStart, i).search(/\S/);
      out.push({ selector, body: css.slice(i + 1, end - 1), index: selStart + (lead > 0 ? lead : 0), at: stack.join(' ') });
      i = end; selStart = i; continue;
    }
    if (ch === '}') { if (stack.length) stack.pop(); depth = Math.max(0, depth - 1); i++; selStart = i; continue; }
    i++;
  }
  return out;
}

const ROOT_SELECTOR = /(^|,)\s*(:root|:host|html|\[data-theme[^\]]*\]|\.dark|\.light)\s*(,|$)/i;
const isRootRule = (r) => ROOT_SELECTOR.test(r.selector) || /^@theme/i.test(r.at) || /^@theme/i.test(r.selector);

// Visible text of a markup file: tags, script, and style stripped.
function visibleText(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ');
}

const GENERIC_FAMILY = /^(system-ui|-apple-system|blinkmacsystemfont|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|sans-serif|serif|monospace|cursive|fantasy|inherit|initial|unset|revert|var\(|emoji|math|fangsong)/i;
const firstFamily = (value) => (value.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');

// A hex literal, not an HTML numeric entity (&#8594;) and not a longer run.
const HEX_LITERAL = /(?<!&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi;
// Data URIs carry megabytes of base64 that no rule here has anything to say about.
const stripDataURIs = (s) => s.replace(/data:[a-z0-9+/.-]+;base64,[A-Za-z0-9+/=\s]+/gi, 'data:stripped');

// Comments describe the code; they are not the code. A comment reading "the one
// allowed !important kill switch" must not be reported as an !important. Blank the
// contents in place so every character index and line number stays exact.
const blankComments = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));

// Font declarations hide behind project-named custom properties (--display, --body),
// not only behind --font-*. Treat a custom property as type when its name names a
// type slot or its value reads as a font stack, and never when the value is a color,
// a length, or another function call.
const FONT_SLOT_NAME = /^--(font[\w-]*|ff|type|typeface|display|body|heading|head|title|serif|sans|mono|numerals?|code|tabular|spec)$/i;
const isFontValue = (v) => /^\s*["']?[A-Za-z]/.test(v) && !/^\s*(var|oklch|rgb|hsl|hwb|lab|lch|color|calc|url|clamp|min|max)\s*\(/i.test(v) && !/^\s*#/.test(v);
const looksLikeFontStack = (v) => /,\s*[\w -]*(serif|sans-serif|monospace|cursive|fantasy|system-ui)\s*$/i.test(v.trim());

const BANNED_FACE = /^(inter|roboto|arial|open sans|lato|poppins|helvetica|helvetica neue|segoe ui|noto sans)$/i;
const MONO_FACE = /^(jetbrains mono|ibm plex mono|roboto mono|fira code|fira mono|source code pro|space mono|courier|courier new|dm mono|geist mono|sf mono|menlo|consolas|monaco)$/i;
const BANNED_HEX = /#(6366f1|7c3aed|8b5cf6|a78bfa|818cf8|c084fc|7e22ce|6d28d9)\b/gi;
const METALLIC_HEX = /#(ffd700|d4af37|c9a227|b8860b|cd7f32|bfa14a|d9b56a|e6be8a)\b/gi;
const METALLIC_WORD = /\b(gold|brass|bronze)\b/gi;
const BUZZWORD = /\b(unleash|unleashing|elevate|elevating|seamless|seamlessly|next[- ]gen(eration)?|supercharge|supercharged|empower|empowering|streamline|streamlining|cutting[- ]edge|world[- ]class|revolutioniz\w*|game[- ]chang\w*|effortless(ly)?|best[- ]in[- ]class|frictionless)\b/gi;
const SPACING_SCALE = new Set([0, 1, 2, 3, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160]);

const ORNAMENTS = [
  [/radial-gradient\([^)]*(?:circle|ellipse)/i, 'radial glow blob'],
  [/@keyframes\s+(marquee|ticker|scroll-x)/i, 'marquee ticker'],
  [/\brepeating-linear-gradient\(/i, 'hatched placeholder fill'],
  [/\banimation:[^;]*\binfinite\b/i, 'always-running ambient motion'],
];

// ---------------------------------------------------------------- per-file scan

const waivers = new Map(); // file -> Set(ruleId)
const scanned = { markup: 0, style: 0 };
let anyStyle = false, anyInteractive = false, anyMotion = false, anyStamp = false, anyFontImport = false;
let sectionCount = 0;
let namedFaces = [];
const sectionPaddings = [];
const allText = [];
const allSourceParts = [];

for (const file of files) {
  let raw;
  try { raw = stripDataURIs(readFileSync(file, 'utf8')); } catch { continue; }
  const ext = extname(file).toLowerCase();
  const fromCwd = relative(process.cwd(), resolve(file));
  const rel = (!fromCwd || fromCwd.startsWith('..')) ? file : fromCwd;

  // Waivers first, off the raw text: they live in comments, which every rule scan
  // below deliberately cannot see.
  const allowed = new Set();
  const waiverRe = /goddesign-allow:\s*([a-z-]+)([^\n*/]*)/gi;
  let wm;
  while ((wm = waiverRe.exec(raw))) {
    const id = wm[1].toLowerCase();
    const reason = (wm[2] || '').trim();
    if (reason.length < 8) add('waiver-without-reason', rel, lineOf(raw, wm.index), `goddesign-allow: ${id} has no stated reason`);
    else allowed.add(id);
  }
  waivers.set(rel, allowed);
  const flag = (rule, line, detail) => { if (!allowed.has(rule)) add(rule, rel, line, detail); };

  if (MARKUP_EXT.has(ext)) scanned.markup++; else scanned.style++;
  if (raw.includes('/* goddesign |')) anyStamp = true;

  // Every rule scan below reads the comment-blanked text, so a comment that names a
  // banned pattern (a lock block, a note about the kill switch) is never a finding.
  const text = blankComments(raw);
  allSourceParts.push(text);

  // ---- markup-level checks
  if (MARKUP_EXT.has(ext)) {
    const inlineRe = /(\sstyle\s*=\s*["'][^"']*["']|style=\{\{)/g;
    let m;
    while ((m = inlineRe.exec(text))) flag('inline-style', lineOf(text, m.index), m[0].trim().slice(0, 48));

    const hrRe = /<hr[\s/>]/gi;
    while ((m = hrRe.exec(text))) flag('hr-divider', lineOf(text, m.index), '<hr> divider');

    if (/<(a|button|input|select|textarea|summary)[\s>]/i.test(text)) anyInteractive = true;
    sectionCount += (text.match(/<section[\s>]/gi) || []).length;

    const attrColor = /\b(fill|stroke|bgcolor|color)\s*=\s*["']#[0-9a-f]{3,8}["']/gi;
    while ((m = attrColor.exec(text))) flag('markup-color', lineOf(text, m.index), m[0]);

    const vis = visibleText(text);
    allText.push(vis);
    let bm;
    const bz = new RegExp(BUZZWORD.source, 'gi');
    while ((bm = bz.exec(vis))) flag('buzzword', 1, bm[0]);

    // Written as escapes so this file obeys the rule it enforces.
    const dashRe = /[\u2013\u2014]/g;
    let dm;
    while ((dm = dashRe.exec(vis))) { flag('dash-in-copy', 1, 'em or en dash in visible copy'); break; }

    // Numbered chapter cadence: 01 / 02 / 03 standing alone as element text.
    const chapters = [...text.matchAll(/>\s*(0[1-9])\s*</g)].map((c) => c[1]);
    if (new Set(chapters).size >= 3) flag('chapter-cadence', 1, `section numbers ${[...new Set(chapters)].join(', ')}`);

    if (/fonts\.googleapis\.com|fonts\.bunny\.net|@font-face|fonts\.gstatic\.com|use\.typekit/i.test(text)) anyFontImport = true;
  }

  // ---- CSS-level checks
  for (const { css, offset } of cssOf(text, ext)) {
    if (!css.trim()) continue;
    anyStyle = true;
    const at = (idx) => lineOf(text, offset + idx);

    if (/fonts\.googleapis\.com|fonts\.bunny\.net|@font-face|use\.typekit/i.test(css)) anyFontImport = true;
    if (/:focus-visible/.test(css)) anyInteractive = anyInteractive; // presence handled below
    if (/@keyframes|transition\s*:|animation\s*:/i.test(css)) anyMotion = true;

    let m;
    const bh = new RegExp(BANNED_HEX.source, 'gi');
    while ((m = bh.exec(css))) flag('banned-hex', at(m.index), m[0]);

    const gt = /(-webkit-)?background-clip\s*:\s*text/gi;
    while ((m = gt.exec(css))) flag('gradient-text', at(m.index), m[0]);

    const ta = /transition\s*:\s*all\b|transition-property\s*:\s*all\b/gi;
    while ((m = ta.exec(css))) flag('transition-all', at(m.index), m[0]);

    const mh = new RegExp(METALLIC_HEX.source, 'gi');
    while ((m = mh.exec(css))) flag('metallic-premium', at(m.index), m[0]);
    const mw = new RegExp(METALLIC_WORD.source, 'gi');
    while ((m = mw.exec(css))) flag('metallic-premium', at(m.index), `token or value named "${m[0]}"`);

    // !important is legal only inside the reduced-motion kill switch.
    const impRe = /!important/gi;
    while ((m = impRe.exec(css))) {
      const before = css.slice(Math.max(0, m.index - 600), m.index);
      const open = before.lastIndexOf('@media');
      const inReduced = open !== -1 && /prefers-reduced-motion/i.test(before.slice(open));
      if (!inReduced) flag('important', at(m.index), '!important outside the reduced-motion kill switch');
    }

    // Side-border accent stripes 3px or wider. The banned pattern is a colored
    // stripe on a container (card, item, callout, alert); a standalone drawn rule
    // or rail is a different device, so the check needs container evidence: either
    // a container-shaped selector or a rule that also paints padding or a ground.
    const stripe = /border-(left|right)(-width)?\s*:\s*([^;]+);/gi;
    while ((m = stripe.exec(css))) {
      const px = /(\d+(?:\.\d+)?)px/.exec(m[3]);
      if (!px || parseFloat(px[1]) < 3) continue;
      const blockStart = css.lastIndexOf('{', m.index);
      const selector = css.slice(Math.max(0, css.lastIndexOf('}', blockStart) + 1), blockStart).replace(/\/\*[\s\S]*?\*\//g, ' ').trim();
      const body = css.slice(blockStart, css.indexOf('}', m.index) + 1);
      const containerish = /card|item|cell|tile|panel|callout|alert|note|quote|box|feature|blockquote|aside|li\b/i.test(selector)
        || /(^|[;{\s])(padding|background)/i.test(body);
      if (containerish) flag('accent-stripe', at(m.index), `${m[0].trim().slice(0, 48)} on "${selector.slice(0, 32)}"`);
    }

    for (const [re, label] of ORNAMENTS) if (re.test(css)) flag('ornament-kit', at(css.search(re)), label);

    // Section-scale vertical padding, for the metronome and ratio checks.
    const padRe = /padding(-block|-top|-bottom)?\s*:\s*([^;]+);/gi;
    while ((m = padRe.exec(css))) {
      for (const v of m[2].matchAll(/(\d+(?:\.\d+)?)(px|rem)/g)) {
        const px = v[2] === 'rem' ? parseFloat(v[1]) * 16 : parseFloat(v[1]);
        if (px >= 32) sectionPaddings.push(px);
        if (v[2] === 'px' && px > 3 && !SPACING_SCALE.has(px))
          flag('off-scale-spacing', at(m.index), `${v[0]} is off the token scale`);
      }
    }

    for (const rule of rulesOf(css)) {
      const root = isRootRule(rule);

      // A bare `section { padding }` rule is the band metronome.
      if (/(^|,)\s*section\s*(,|$)/i.test(rule.selector) && /padding/i.test(rule.body))
        flag('metronome-padding', at(rule.index), `bare "section" rule sets padding: ${rule.selector}`);

      // Color literals belong in :root, once each.
      if (!root) {
        const hexRe = new RegExp(HEX_LITERAL.source, 'gi');
        let h;
        while ((h = hexRe.exec(rule.body))) {
          if (/^#(fff|ffffff|000|000000)$/i.test(h[0])) continue; // caught by pure-base with better context
          flag('hex-outside-root', at(rule.index), `${h[0]} in "${rule.selector.slice(0, 40)}" (tokens live in :root)`);
        }
      }

      // Font families: the chosen face, not the fallback stack.
      const famRe = /(?:^|[;{\s])(font-family|--[\w-]+)\s*:\s*([^;}]+)/gi;
      let f;
      while ((f = famRe.exec(rule.body))) {
        const prop = f[1].trim(), value = f[2];
        const isCustomProp = prop.startsWith('--');
        if (isCustomProp && !((FONT_SLOT_NAME.test(prop) && isFontValue(value)) || looksLikeFontStack(value))) continue;
        const fam = firstFamily(value);
        if (!fam || GENERIC_FAMILY.test(fam)) continue;
        namedFaces.push(fam);
        if (BANNED_FACE.test(fam)) flag('banned-font', at(rule.index), `${fam} as a chosen face (${prop})`);
        if (/^space grotesk$/i.test(fam)) flag('space-grotesk', at(rule.index), 'legal as body only under fonts.md pairing 6');
        // A mono face is legal in the slot a direction row states (numerals, code,
        // spec blocks). It is banned as the body or display voice. Custom properties
        // declare their own slot, so judge those by name, never by living in :root.
        const monoSlot = isCustomProp && /^--(font-)?(mono|numerals?|code|data|tabular|spec)/i.test(prop);
        const bodyish = isCustomProp
          ? /^--(font-)?(body|base|text|display|heading|head|title|sans|serif)$/i.test(prop)
          : root || /(^|,|\s)(body|p|main)(\s|,|$)/i.test(rule.selector);
        if (MONO_FACE.test(fam) && bodyish && !monoSlot) flag('mono-body', at(rule.index), `${fam} as ${prop === 'font-family' ? 'body or display type' : prop}`);
      }

      // Pure and untinted bases.
      const bgRe = /(?:^|[;{\s])(background(?:-color)?|--bg[\w-]*|--surface[\w-]*|--paper[\w-]*)\s*:\s*([^;}]+)/gi;
      let b;
      while ((b = bgRe.exec(rule.body))) {
        const v = b[2].trim().toLowerCase();
        const pure = /^(#fff|#ffffff|white|#000|#000000|black)$/.test(v);
        const pageLevel = root || /(^|,)\s*(body|html)\s*(,|$)/i.test(rule.selector) || b[1].startsWith('--');
        if (pure && pageLevel) flag('pure-base', at(rule.index), `${b[1]}: ${v}`);
      }

      if (root) {
        const varRe = /(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\b/gi;
        let v;
        while ((v = varRe.exec(rule.body))) {
          if (!/bg|surface|paper|panel|card|text|ink|muted|border|fg|foreground/i.test(v[1])) continue;
          const hex = v[2].toLowerCase();
          const [r, g, bl] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)];
          if (r === g && g === bl && !/^(ffffff|000000)$/.test(hex.slice(1)))
            flag('untinted-neutral', at(rule.index), `${v[1]}: ${v[2]} is achromatic; tint neutrals toward the brand hue`);
        }
      }

      // Token conformance, when a baseline was supplied.
      if (baseline) {
        const known = new Set((baseline.hexes || []).map((h) => h.toLowerCase()));
        const knownFonts = new Set((baseline.fonts || []).map((s) => s.toLowerCase()));
        const knownRadii = new Set((baseline.radius || []).map((s) => s.trim()));
        let h;
        const hexRe2 = new RegExp(HEX_LITERAL.source, 'gi');
        while ((h = hexRe2.exec(rule.body)))
          if (!known.has(h[0].toLowerCase())) flag('token-drift', at(rule.index), `${h[0]} is outside the token baseline`);
        let f2;
        const famRe2 = /(font-family|--[\w-]+)\s*:\s*([^;}]+)/gi;
        while ((f2 = famRe2.exec(rule.body))) {
          const prop = f2[1].trim(), value = f2[2];
          if (prop.startsWith('--') && !((FONT_SLOT_NAME.test(prop) && isFontValue(value)) || looksLikeFontStack(value))) continue;
          const fam = firstFamily(value);
          if (fam && !GENERIC_FAMILY.test(fam) && !knownFonts.has(fam.toLowerCase()))
            flag('token-drift', at(rule.index), `font "${fam}" is outside the token baseline`);
        }
        let rr;
        const radRe = /border-radius\s*:\s*([^;}]+)/gi;
        while ((rr = radRe.exec(rule.body)))
          if (knownRadii.size && !knownRadii.has(rr[1].trim()))
            flag('token-drift', at(rule.index), `radius "${rr[1].trim()}" is outside the token baseline`);
      }
    }
  }
}

// ---------------------------------------------------------------- whole-build checks

const allSource = allSourceParts.join('\n');
const waivedAnywhere = (rule) => [...waivers.values()].some((s) => s.has(rule));
const globalFlag = (rule, detail) => { if (!waivedAnywhere(rule)) add(rule, '(build)', 0, detail); };

if (anyStyle) {
  if (!anyStamp) globalFlag('no-stamp', 'no /* goddesign | structure | direction | accent */ stamp in any stylesheet');

  const named = [...new Set(namedFaces.filter((f) => !GENERIC_FAMILY.test(f)))];
  if (named.length && !anyFontImport)
    globalFlag('no-webfont', `${named.slice(0, 3).join(', ')}: named but never imported or declared, so the page falls back to a system face silently`);

  if (anyInteractive && !/:focus-visible/.test(allSource))
    globalFlag('no-focus-visible', 'no :focus-visible rule anywhere; the a11y floor requires a 2px outline that is never removed');

  if (anyMotion && !/prefers-reduced-motion/i.test(allSource))
    globalFlag('no-reduced-motion', 'motion is present but prefers-reduced-motion is never honored');

  // The band metronome is a page-scale rhythm defect, so it needs a page: a
  // component file or a single-band experiment has no rhythm to break.
  const distinct = [...new Set(sectionPaddings)].sort((a, b) => a - b);
  if (sectionPaddings.length >= 3 && sectionCount >= 3) {
    if (distinct.length < 3)
      globalFlag('metronome-padding', `section-scale padding takes ${distinct.length} distinct value(s) (${distinct.join(', ')}); the gate wants 3 or more`);
    else if (distinct[distinct.length - 1] < distinct[0] * 2)
      globalFlag('padding-ratio', `largest section padding ${distinct[distinct.length - 1]}px is under 2x the smallest ${distinct[0]}px`);
  }
}

// The reveal bug: content parked at opacity 0 behind an observer, with no js guard
// and no timeout. This is what rendered two baseline validation pages completely
// blank in static capture.
if (/IntersectionObserver/.test(allSource)) {
  const zeroed = (allSource.match(/opacity\s*:\s*0\b/g) || []).length;
  const guarded = /(html|document\.documentElement)[^\n]{0,60}\.(classList|className)[^\n]{0,40}\bjs\b/.test(allSource)
    || /\.no-js\b/.test(allSource) || /html\.js\b/.test(allSource);
  const timed = /setTimeout/.test(allSource);
  if (zeroed >= 2 && !guarded && !timed)
    globalFlag('reveal-cascade', `${zeroed} rules at opacity 0 behind IntersectionObserver with no html.js guard and no reveal timeout`);
}

// ---------------------------------------------------------------- report

const failures = findings.filter((f) => f.severity === 'fail');
const advisories = findings.filter((f) => f.severity === 'advisory');

if (asJson) {
  console.log(JSON.stringify({
    files: files.length,
    scanned,
    failures: failures.length,
    advisories: advisories.length,
    findings,
  }, null, 1));
} else {
  console.log(`goddesign sweep: ${files.length} file(s), ${scanned.markup} markup, ${scanned.style} stylesheet(s)${baseline ? ', token baseline active' : ''}`);
  const print = (list, label) => {
    if (!list.length) return;
    console.log(`\n${label} (${list.length}):`);
    for (const f of list) console.log(`  ${f.rule}  ${f.file}${f.line ? `:${f.line}` : ''}  ${f.detail}`);
  };
  print(failures, 'FAILURES');
  print(advisories, 'ADVISORY');
  if (!failures.length) console.log('\nsweep: green (advisories do not fail the gate).');
  else console.log('\nsweep: fix the named failures, then re-run. The DIRECTION LOCK stays frozen during the fix loop.');
}

process.exit(failures.length ? 1 : 0);
