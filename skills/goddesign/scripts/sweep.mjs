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
// Rust frontends are read through their UI macros (Leptos view!, Yew html!, Dioxus
// rsx!); a .rs file with none is skipped and counted, never scanned as markup.
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
  ['banned-font', 'fail', 'Inter, Roboto, Arial, Arial Black, Open Sans, Lato, Poppins, Helvetica, Segoe UI, or Noto Sans as a chosen face, or a system stack (system-ui, -apple-system) in the chosen-face position'],
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
  ['vague-attribution', 'advisory', 'a claim attributed to unnamed experts, reports, studies, critics, or observers'],
  ['filler-copy', 'advisory', 'a filler phrase that can be shortened without changing meaning'],
  ['formulaic-copy', 'advisory', 'a stock contrast, challenge frame, or generic conclusion'],
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
const MARKUP_EXT = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.js', '.ts', '.mjs', '.rs']);
// target is Cargo's build output: rustdoc HTML, the compiled site, generated sources.
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', '.svelte-kit', 'vendor', 'target', '.playwright-cli', '.playwright-mcp']);

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
  console.error('SWEEP UNAVAILABLE: no .html/.css/.jsx/.tsx/.vue/.svelte/.astro/.rs files under the given targets.');
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
      // Statement at-rules (@import, @charset, @namespace, @layer a, b;) end in a
      // semicolon and carry no block, so they are finished business by the time
      // the next '{' arrives. Without dropping them the text before that brace
      // still starts with '@', the rule below reads the NEXT rule as an at-rule
      // container, and its declarations are never scanned. goddesign mandates an
      // @import for webfonts and :root first for tokens, so that combination is
      // the shape the skill itself prescribes.
      const rawSel = css.slice(selStart, i).replace(/\/\*[\s\S]*?\*\//g, ' ');
      const selOffset = rawSel.lastIndexOf(';') + 1;
      const selText = rawSel.slice(selOffset);
      const selector = selText.trim();
      // Most at-rules (@media, @supports, @layer) hold rules, so walk into them and
      // carry the at-rule as context. @theme holds bare declarations the way :root
      // does (Tailwind v4, and extract-tokens.mjs reads it as a token source), so
      // walking into it finds no inner rule and its tokens are never scanned at all.
      if (selector.startsWith('@') && !/^@theme\b/i.test(selector)) { stack.push(selector); depth++; i++; selStart = i; continue; }
      let end = i + 1, inner = 1;
      while (end < css.length && inner > 0) {
        if (css[end] === '/' && css[end + 1] === '*') { const e2 = css.indexOf('*/', end); end = e2 === -1 ? css.length : e2 + 2; continue; }
        if (css[end] === '{') inner++;
        else if (css[end] === '}') inner--;
        end++;
      }
      const lead = selText.search(/\S/);
      out.push({ selector, body: css.slice(i + 1, end - 1), index: selStart + selOffset + (lead > 0 ? lead : 0), at: stack.join(' ') });
      i = end; selStart = i; continue;
    }
    if (ch === '}') { if (stack.length) stack.pop(); depth = Math.max(0, depth - 1); i++; selStart = i; continue; }
    i++;
  }
  return out;
}

const ROOT_SELECTOR = /(^|,)\s*(:root|:host|html|\[data-theme[^\]]*\]|\.dark|\.light)\s*(,|$)/i;
const isRootRule = (r) => ROOT_SELECTOR.test(r.selector) || /^@theme/i.test(r.at) || /^@theme/i.test(r.selector);

// Visible text of a markup file: tags, script, and style blanked in place. Keeping
// length and newlines stable lets copy findings report their real source line.
function visibleText(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, blank)
    .replace(/<style[\s\S]*?<\/style>/gi, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<[^>]+>/g, blank)
    .replace(/&[a-z]+;|&#(?:x[0-9a-f]+|\d+);/gi, blank);
}

// Rust frontends write their markup inside macros: Leptos view! and Yew html! in
// tag syntax (<div class="x">"text"</div>), Dioxus rsx! as div { class: "x", "text" }.
// The rest of a .rs file is Rust, which no rule here can read, and the SWEEP
// UNAVAILABLE that .rs used to get pushed every Rust frontend to DEGRADED: no sweep.
// So this lexes just far enough to find those bodies: comments blanked (they nest),
// string and char literals located, so a brace or a "view!" inside either is never
// read as code. Every view keeps the file's length and newlines, so findings report
// their real source line. Returns null when the file has no UI macro: a server or
// domain module has nothing for a design gate.
//   code    the whole file, comments blanked
//   markup  macro bodies only, comments blanked, literals intact
//   tags    macro bodies only, literals blanked: structure without copy
//   copy    only the literals in text position: the visible copy
//   texts   those literals' contents, for the chapter-number check
//   css     the literals inside <style> elements, as cssOf() returns them
const UI_MACRO = /\b(view|html|rsx)\s*!\s*([{(\[])/g;
const CLOSER = { '{': '}', '(': ')', '[': ']' };

function rustMarkup(src) {
  const n = src.length;
  const isIdent = (ch) => ch !== undefined && /\w/.test(ch);
  const blankRange = (chars, from, to) => { for (let k = from; k < to; k++) if (chars[k] !== '\n') chars[k] = ' '; };
  const keep = (chars, ranges) => {
    const out = chars.map((ch) => (ch === '\n' ? '\n' : ' '));
    for (const [from, to] of ranges) for (let k = from; k < to; k++) out[k] = chars[k];
    return out.join('');
  };

  const code = src.split('');
  const literals = []; // open..close is the whole token, start..end its contents
  let i = 0;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      const e = src.indexOf('\n', i);
      const end = e === -1 ? n : e;
      blankRange(code, i, end); i = end; continue;
    }
    if (c === '/' && d === '*') {
      let j = i + 2, depth = 1;
      while (j < n && depth) {
        if (src[j] === '/' && src[j + 1] === '*') { depth++; j += 2; }
        else if (src[j] === '*' && src[j + 1] === '/') { depth--; j += 2; }
        else j++;
      }
      blankRange(code, i, j); i = j; continue;
    }
    // Raw strings (r"..", r#".."#, br"..", cr"..") have no escapes and close on the
    // same number of hashes. r#type is a raw identifier, not a string.
    if ((c === 'r' || c === 'b' || c === 'c') && !isIdent(src[i - 1])) {
      let j = c === 'r' ? i + 1 : d === 'r' ? i + 2 : -1;
      if (j !== -1) {
        let hashes = 0;
        while (src[j] === '#') { hashes++; j++; }
        if (src[j] === '"') {
          const closer = '"' + '#'.repeat(hashes);
          const e = src.indexOf(closer, j + 1);
          const end = e === -1 ? n : e;
          literals.push({ open: i, start: j + 1, end, close: Math.min(n, end + closer.length) });
          i = end + closer.length; continue;
        }
      }
    }
    const quote = c === '"' ? i : (c === 'b' || c === 'c') && d === '"' && !isIdent(src[i - 1]) ? i + 1 : -1;
    if (quote !== -1) {
      let j = quote + 1;
      while (j < n && src[j] !== '"') j += src[j] === '\\' ? 2 : 1;
      const end = Math.min(j, n);
      literals.push({ open: i, start: quote + 1, end, close: Math.min(n, end + 1) });
      i = end + 1; continue;
    }
    // A char literal ('x', '\'', '"', '\u{2014}') or a lifetime ('a, 'static). Only
    // the literal can hold a quote or a brace that would throw the scan off.
    if (c === "'") {
      let end = -1;
      if (d === '\\') end = src.indexOf("'", i + 3);
      else if (d !== undefined && d !== '\n') {
        const w = src.codePointAt(i + 1) > 0xffff ? 2 : 1;
        if (src[i + 1 + w] === "'") end = i + 1 + w;
      }
      if (end !== -1) { literals.push({ open: i, start: i + 1, end, close: end + 1, char: true }); i = end + 1; continue; }
    }
    i++;
  }

  const bare = code.slice();
  for (const l of literals) blankRange(bare, l.open, l.close);
  const bareText = bare.join('');

  // Outermost macros only: a view! nested inside another's body is already in it.
  const bodies = [];
  const re = new RegExp(UI_MACRO.source, 'g');
  let m;
  while ((m = re.exec(bareText))) {
    const opener = m[2], closer = CLOSER[opener];
    let j = m.index + m[0].length, depth = 1;
    while (j < n && depth) { if (bareText[j] === opener) depth++; else if (bareText[j] === closer) depth--; j++; }
    bodies.push([m.index + m[0].length, depth ? n : j - 1]);
    re.lastIndex = j;
  }
  if (!bodies.length) return null;
  const inBody = (k) => bodies.some(([from, to]) => k >= from && k < to);

  const tags = keep(bare, bodies);
  const css = [], styleSpans = [];
  const styleRe = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;
  while ((m = styleRe.exec(tags))) styleSpans.push([m.index, m.index + m[0].length]);
  const inStyle = (k) => styleSpans.some(([from, to]) => k >= from && k < to);

  // Copy is a literal in text position. One right after = or : is an attribute
  // value (class="x" in tag syntax, class: "x" in rsx!) or a comparison, not copy.
  const texts = [], copyRanges = [];
  for (const l of literals) {
    if (l.char || !inBody(l.open)) continue;
    if (inStyle(l.open)) { css.push({ css: blankComments(src.slice(l.start, l.end)), offset: l.start }); continue; }
    let k = l.open - 1;
    while (k >= 0 && /\s/.test(bareText[k])) k--;
    if (bareText[k] === '=' || bareText[k] === ':') continue;
    texts.push(src.slice(l.start, l.end));
    copyRanges.push([l.start, l.end]);
  }

  return { code: code.join(''), markup: keep(code, bodies), tags, copy: keep(code, copyRanges), texts, css };
}

// CSS keywords and the true generic families. These are never a chosen face and
// never need an import, so they are skipped outright wherever they appear.
const GENERIC_FAMILY = /^(sans-serif|serif|monospace|cursive|fantasy|inherit|initial|unset|revert|var\(|emoji|math|fangsong)/i;
// The system stack. No direction row can state one: CONTRIBUTING.md requires
// every row carry a real family and a working import line, and none of these
// have one. In a fallback tail they are correct and firstFamily() never reads
// them; in position 1 they are the placeholder floor wearing a keyword, which
// is what SKILL.md's Banned list means by "or a system stack as a chosen face".
const SYSTEM_STACK = /^(system-ui|-apple-system|blinkmacsystemfont|ui-sans-serif|ui-serif|ui-monospace|ui-rounded)/i;
// Neither kind needs a webfont import or belongs to a token baseline.
const NOT_A_FACE = (f) => GENERIC_FAMILY.test(f) || SYSTEM_STACK.test(f);
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

// Anchored on the whole family string, so every banned family has to be spelled
// out: "Arial Black" is a distinct family name and never matches "arial".
const BANNED_FACE = /^(inter|roboto|arial|arial black|open sans|lato|poppins|helvetica|helvetica neue|segoe ui|noto sans)$/i;
const MONO_FACE = /^(jetbrains mono|ibm plex mono|roboto mono|fira code|fira mono|source code pro|space mono|courier|courier new|dm mono|geist mono|sf mono|menlo|consolas|monaco)$/i;
const BANNED_HEX = /#(6366f1|7c3aed|8b5cf6|a78bfa|818cf8|c084fc|7e22ce|6d28d9)\b/gi;
const METALLIC_HEX = /#(ffd700|d4af37|c9a227|b8860b|cd7f32|bfa14a|d9b56a|e6be8a)\b/gi;
const METALLIC_WORD = /\b(gold|brass|bronze)\b/gi;
const BUZZWORD = /\b(unleash|unleashing|elevate|elevating|seamless|seamlessly|next[- ]gen(eration)?|supercharge|supercharged|empower|empowering|streamline|streamlining|cutting[- ]edge|world[- ]class|revolutioniz\w*|game[- ]chang\w*|effortless(ly)?|best[- ]in[- ]class|frictionless)\b/gi;
const VAGUE_ATTRIBUTION = /\b(?:experts|analysts|researchers|studies|reports|industry (?:leaders|reports|research)|some (?:critics|observers))\s+(?:say|says|believe|believes|suggest|suggests|show|shows|indicate|indicates|argue|argues|agree|agrees|find|finds|have found)\b/gi;
const FILLER_COPY = /\b(?:in order to|due to the fact that|it is important to note that|it should be noted that|at this point in time|in the event that|for the purpose of)\b/gi;
const FORMULAIC_COPY = /\b(?:not (?:just|only) [^.!?]{1,80},?\s+but (?:also )?[^.!?]{1,80}|despite (?:the|these|those|its|many|numerous)?\s*challenges[^.!?]{0,100}\bcontinues? to (?:thrive|grow|evolve|succeed)|the future (?:looks|is) bright|the possibilities are endless|this is (?:just|only) the beginning|only time will tell)\b/gi;
const SPACING_SCALE = new Set([0, 1, 2, 3, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160]);

const ORNAMENTS = [
  [/radial-gradient\([^)]*(?:circle|ellipse)/i, 'radial glow blob'],
  [/@keyframes\s+(marquee|ticker|scroll-x)/i, 'marquee ticker'],
  [/\brepeating-linear-gradient\(/i, 'hatched placeholder fill'],
  [/\banimation:[^;]*\binfinite\b/i, 'always-running ambient motion'],
];

// ---------------------------------------------------------------- per-file scan

const waivers = new Map(); // file -> Set(ruleId)
const scanned = { markup: 0, style: 0, skipped: 0 };
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

  const rust = ext === '.rs' ? rustMarkup(raw) : null;
  if (ext === '.rs' && !rust) { scanned.skipped++; continue; }

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
  const text = rust ? rust.markup : blankComments(raw);
  allSourceParts.push(rust ? rust.code : text);

  // ---- markup-level checks
  if (MARKUP_EXT.has(ext)) {
    // A Rust macro body is not HTML (rustMarkup above): structure is read from the
    // literal-blanked body, copy from its text-position literals, and each pattern
    // takes both macro syntaxes. A Leptos style:prop= directive is an inline style.
    const tags = rust ? rust.tags : text;
    const inlineRe = rust
      ? /(?<![\w:-])style(?:(?::[\w-]+)?\s*=(?!=)|\s*:(?!:))/g
      : /(\sstyle\s*=\s*["'][^"']*["']|style=\{\{)/g;
    let m;
    while ((m = inlineRe.exec(tags)))
      flag('inline-style', lineOf(tags, m.index), (rust ? text.slice(m.index).split('\n')[0] : m[0]).trim().slice(0, 48));

    const hrRe = rust ? /<hr[\s/>]|(?<![\w:.-])hr\s*\{/gi : /<hr[\s/>]/gi;
    while ((m = hrRe.exec(tags))) flag('hr-divider', lineOf(tags, m.index), '<hr> divider');

    const interactive = rust
      ? /<(a|button|input|select|textarea|summary)[\s/>]|(?<![\w:.-])(a|button|input|select|textarea|summary)\s*\{/i
      : /<(a|button|input|select|textarea|summary)[\s>]/i;
    if (interactive.test(tags)) anyInteractive = true;
    sectionCount += (tags.match(rust ? /<section[\s/>]|(?<![\w:.-])section\s*\{/gi : /<section[\s>]/gi) || []).length;

    const attrColor = rust
      ? /\b(fill|stroke|bgcolor|color)\s*[=:]\s*"#[0-9a-f]{3,8}"/gi
      : /\b(fill|stroke|bgcolor|color)\s*=\s*["']#[0-9a-f]{3,8}["']/gi;
    while ((m = attrColor.exec(text))) flag('markup-color', lineOf(text, m.index), m[0]);

    const vis = rust ? rust.copy : visibleText(text);
    allText.push(vis);
    const scanVisible = (rule, pattern) => {
      const re = new RegExp(pattern.source, pattern.flags);
      let hit;
      while ((hit = re.exec(vis))) flag(rule, lineOf(vis, hit.index), hit[0].trim().slice(0, 120));
    };
    scanVisible('buzzword', BUZZWORD);
    scanVisible('vague-attribution', VAGUE_ATTRIBUTION);
    scanVisible('filler-copy', FILLER_COPY);
    scanVisible('formulaic-copy', FORMULAIC_COPY);

    // Written as escapes so this file obeys the rule it enforces.
    const dashRe = /[\u2013\u2014]/g;
    let dm;
    while ((dm = dashRe.exec(vis))) { flag('dash-in-copy', lineOf(vis, dm.index), 'em or en dash in visible copy'); break; }

    // Numbered chapter cadence: 01 / 02 / 03 standing alone as element text.
    const chapters = rust
      ? rust.texts.map((t) => (/^\s*(0[1-9])\s*$/.exec(t) || [])[1]).filter(Boolean)
      : [...text.matchAll(/>\s*(0[1-9])\s*</g)].map((c) => c[1]);
    if (new Set(chapters).size >= 3) flag('chapter-cadence', 1, `section numbers ${[...new Set(chapters)].join(', ')}`);

    if (/fonts\.googleapis\.com|fonts\.bunny\.net|@font-face|fonts\.gstatic\.com|use\.typekit/i.test(rust ? rust.code : text)) anyFontImport = true;
  }

  // ---- CSS-level checks
  for (const { css, offset } of (rust ? rust.css : cssOf(text, ext))) {
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
        // Flagged, then dropped: a system stack is banned as the chosen face but
        // must never be reported as a face that is missing its import.
        if (SYSTEM_STACK.test(fam)) {
          flag('banned-font', at(rule.index), `${fam} as a chosen face (${prop}): a system stack is not a face the deck can state`);
          continue;
        }
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
          if (fam && !NOT_A_FACE(fam) && !knownFonts.has(fam.toLowerCase()))
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

if (!scanned.markup && !scanned.style) {
  console.error(`SWEEP UNAVAILABLE: nothing scannable under the given targets (${scanned.skipped} .rs file(s), none with a view!, html!, or rsx! macro).`);
  process.exit(2);
}

// ---------------------------------------------------------------- whole-build checks

const allSource = allSourceParts.join('\n');
const waivedAnywhere = (rule) => [...waivers.values()].some((s) => s.has(rule));
const globalFlag = (rule, detail) => { if (!waivedAnywhere(rule)) add(rule, '(build)', 0, detail); };

if (anyStyle) {
  if (!anyStamp) globalFlag('no-stamp', 'no /* goddesign | structure | direction | accent */ stamp in any stylesheet');

  const named = [...new Set(namedFaces.filter((f) => !NOT_A_FACE(f)))];
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
  console.log(`goddesign sweep: ${files.length} file(s), ${scanned.markup} markup, ${scanned.style} stylesheet(s)${scanned.skipped ? `, ${scanned.skipped} .rs with no UI macro skipped` : ''}${baseline ? ', token baseline active' : ''}`);
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
