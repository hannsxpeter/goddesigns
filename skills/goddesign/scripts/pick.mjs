#!/usr/bin/env node
// goddesign pick: the variance engine, executed by a script.
//
// Why this exists: a model cannot pick at random, and it does not remember what
// it built for this person last month. Until v2.0.0 the skill asked the model to
// do both in prose: roll a shell seed, read two ledgers, apply four rotation
// rules, index four decks, and jitter the tokens by hand. That meant reading
// about 5k tokens of decks on every run and trusting model arithmetic. This
// script does the mechanical half and prints only what the run needs: one
// direction row, one macrostructure, the jittered tokens, and a pre-filled
// DIRECTION LOCK. Deck sizes are read from the decks, so no modulus can drift.
//
// Usage:
//   node pick.mjs                    roll for the project in the current directory
//   node pick.mjs --keep-direction   the brief names the aesthetic: roll the structure only
//   node pick.mjs --reroll           steering override ("less AI"): also change display class and accent band
//   node pick.mjs --seed <n>         fixed seed (reproducible runs, tests)
//   node pick.mjs --show <deck>:<i>  print one row of directions, layouts, palettes, or fonts
//   node pick.mjs --log '<json>'     append a run entry to both ledgers, after the gate
//   node pick.mjs --check            install integrity: decks parse, rows complete, fallback moduli match
//   node pick.mjs --json             machine-readable pick
//
// Ledgers: ./.design-log.json keeps the last 20 entries; the user ledger at
// $GODDESIGN_USER_LEDGER, or ~/.design-log.json, keeps the last 40.
// Exit codes: 0 ok, 1 incomplete install or refused input, 2 usage error.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DISPLAY_CLASSES = ['serif', 'grotesque', 'mono', 'slab', 'display'];
const PAPERS = ['dark', 'mid', 'light'];
const DECKS = {
  directions: 'directions.md',
  layouts: 'layouts.md',
  palettes: 'palettes.md',
  fonts: 'fonts.md',
};

// ---------------------------------------------------------------- arguments

const USAGE = `usage: node pick.mjs [--keep-direction] [--reroll] [--seed <n>] [--json]
       node pick.mjs --show <directions|layouts|palettes|fonts>:<index>
       node pick.mjs --log '<json entry>' [--map-final] [--no-user]
       node pick.mjs --check`;

function usage(message) {
  if (message) console.error(`pick: ${message}`);
  console.error(USAGE);
  process.exit(2);
}

function parseArgs(argv) {
  const opt = { keepDirection: false, reroll: false, json: false, check: false, mapFinal: false, noUser: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      if (i + 1 >= argv.length) usage(`${a} needs a value`);
      return argv[++i];
    };
    if (a === '--keep-direction') opt.keepDirection = true;
    else if (a === '--reroll') opt.reroll = true;
    else if (a === '--json') opt.json = true;
    else if (a === '--check') opt.check = true;
    else if (a === '--map-final') opt.mapFinal = true;
    else if (a === '--no-user') opt.noUser = true;
    else if (a === '--seed') {
      const n = Number(value());
      if (!Number.isInteger(n) || n < 0) usage('--seed takes a non-negative integer');
      opt.seed = n;
    } else if (a === '--show') opt.show = value();
    else if (a === '--log') opt.log = value();
    else if (a === '--help' || a === '-h') { console.log(USAGE); process.exit(0); }
    else usage(`unknown argument ${a}`);
  }
  if (opt.keepDirection && opt.reroll) usage('--reroll changes the direction, and --keep-direction keeps the brief\'s');
  return opt;
}

// ---------------------------------------------------------------- decks

function incomplete(problems) {
  for (const p of problems) console.log(`INCOMPLETE INSTALL: ${p}`);
  console.log('goddesign: do not run. Reinstall the full skill directory (docs/INSTALL.md); never rebuild a deck row from memory.');
  process.exit(1);
}

function readReference(file) {
  const path = join(ROOT, 'references', file);
  let text = '';
  try { text = readFileSync(path, 'utf8'); } catch { /* reported below */ }
  if (!text.trim()) incomplete([`references/${file} not found`]);
  return text;
}

const rowLine = (body, label) => {
  const m = new RegExp(`^- ${label}:[ \\t]*(.+)$`, 'm').exec(body);
  return m ? m[1].trim() : null;
};

export function parseDirections(text) {
  return text.split(/^## (?=\d+\. )/m).slice(1).map((chunk) => {
    const newline = chunk.indexOf('\n');
    const head = /^(\d+)\. (.+?)\s*$/.exec(chunk.slice(0, newline)) || [];
    const body = chunk.slice(newline + 1).replace(/\n-{3,}\s*$/, '').trim();
    const colors = rowLine(body, 'Colors') || '';
    const roles = [];
    for (const m of colors.matchAll(/(?:^|[\s,(])([a-z][a-z-]*) (#[0-9A-Fa-f]{6})\b/g)) {
      if (!roles.some((r) => r.role === m[1])) roles.push({ role: m[1], hex: m[2].toUpperCase() });
    }
    const hex = (role) => roles.find((r) => r.role === role)?.hex ?? null;
    const cls = /display=([a-z]+)/.exec(rowLine(body, 'Class') || '');
    const radius = /^- Radius:[ \t]*(.+)$/m.exec(body);
    return {
      index: Number(head[1]),
      name: head[2],
      body,
      roles,
      bg: hex('bg'),
      surface: hex('surface'),
      accent: hex('accent'),
      type: rowLine(body, 'Type'),
      import: (rowLine(body, 'Import') || '').replace(/`/g, ''),
      background: rowLine(body, 'Background'),
      signature: rowLine(body, 'Signature'),
      motion: rowLine(body, 'Motion'),
      display: cls ? cls[1] : null,
      radius: radius ? radius[1].trim() : null,
    };
  });
}

export function parseLayouts(text) {
  return [...text.matchAll(/^(\d+)\. \*\*(.+?)\*\*: (.+)$/gm)]
    .map((m) => ({ index: Number(m[1]), name: m[2], body: m[3].trim() }));
}

export function parsePalettes(text) {
  return [...text.matchAll(/^(\d+)\. \*\*(.+?)\*\* \((.+?)\)\n[ \t]+(.+)$/gm)]
    .map((m) => ({ index: Number(m[1]), name: m[2], mood: m[3], body: m[4].trim() }));
}

export function parseFonts(text) {
  return [...text.matchAll(/^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|$/gm)]
    .map((m) => ({ index: Number(m[1]), name: `${m[2]} / ${m[3]}`, display: m[2], body: m[3], register: m[4] }));
}

function directionProblems(row) {
  const problems = [];
  for (const role of ['bg', 'surface', 'accent']) if (!row[role]) problems.push(`no ${role} hex`);
  if (!row.roles.some((r) => r.role === 'text')) problems.push('no text hex');
  for (const field of ['type', 'import', 'radius', 'background', 'signature', 'motion'])
    if (!row[field]) problems.push(`no ${field} line`);
  if (!DISPLAY_CLASSES.includes(row.display)) problems.push(`no Class line with display=${DISPLAY_CLASSES.join('|')}`);
  return problems;
}

export function loadDecks() {
  const decks = {
    directions: parseDirections(readReference(DECKS.directions)),
    layouts: parseLayouts(readReference(DECKS.layouts)),
    palettes: parsePalettes(readReference(DECKS.palettes)),
    fonts: parseFonts(readReference(DECKS.fonts)),
  };
  const problems = [];
  for (const [name, rows] of Object.entries(decks)) {
    if (!rows.length) problems.push(`references/${DECKS[name]} has no rows`);
    rows.forEach((r, i) => {
      if (r.index !== i) problems.push(`references/${DECKS[name]} row ${i} is indexed ${r.index}`);
    });
  }
  decks.directions.forEach((row) => {
    for (const p of directionProblems(row)) problems.push(`references/directions.md row ${row.index} ${row.name}: ${p}`);
  });
  if (problems.length) incomplete(problems);
  return decks;
}

// ---------------------------------------------------------------- color

// sRGB hex to OKLCH (Bjorn Ottosson's OKLab), enough precision to classify
// paper bands and accent hue bands and to report the jittered hue.
export function hexToOklch(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = lin;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return { L, C: Math.hypot(A, B), H: H < 0 ? H + 360 : H };
}

// SKILL.md's four accent bands. A neutral accent (chroma under 0.02) has no hue.
export function hueBand(hue) {
  if (hue === null || hue === undefined || hue === '' || Number.isNaN(Number(hue))) return 'neutral';
  const h = Number(hue);
  if (h >= 10 && h <= 60) return 'warm';
  if (h >= 200 && h <= 300) return 'cool';
  return 'other';
}

export function rowTraits(row, jitter) {
  const bg = hexToOklch(row.bg);
  const accent = hexToOklch(row.accent);
  const L = bg.L + jitter.l * 0.01;
  const paper = L < 0.4 ? 'dark' : L > 0.8 ? 'light' : 'mid';
  const hue = accent.C < 0.02 ? null : Math.round((((accent.H + jitter.h) % 360) + 360) % 360);
  return { paper, display: row.display, hue, band: hueBand(hue), baseHue: accent.C < 0.02 ? null : Math.round(accent.H * 10) / 10 };
}

// ---------------------------------------------------------------- ledgers

const PROJECT_LEDGER = '.design-log.json';
const userLedgerPath = () => process.env.GODDESIGN_USER_LEDGER || join(homedir(), '.design-log.json');

function readLedger(path) {
  try {
    const v = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(v) ? v.filter((e) => e && typeof e === 'object') : [];
  } catch {
    return [];
  }
}

export function ledgerState(project, user) {
  // The same run is written to both ledgers, so identical entries count once.
  const seen = new Set();
  const last8 = [...project.slice(-8), ...user.slice(-8)].filter((e) => {
    const key = JSON.stringify(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const count = (field) => last8.reduce((acc, e) => {
    if (e[field]) acc[e[field]] = (acc[e[field]] || 0) + 1;
    return acc;
  }, {});
  return {
    empty: !project.length && !user.length,
    recentStructures: [...new Set([...project.slice(-3), ...user.slice(-3)].map((e) => e.structure).filter(Boolean))],
    previous: [project.at(-1), user.at(-1)].filter(Boolean),
    userLast2: user.slice(-2),
    directionCounts: count('direction'),
    structureCounts: count('structure'),
    projectCount: project.length,
    userCount: user.length,
  };
}

function directionIssues(row, traits, state) {
  const issues = [];
  for (const prev of state.previous) {
    if (prev.paper === traits.paper && prev.display === traits.display && hueBand(prev.accent_hue_deg) === traits.band)
      issues.push(`it matches the previous run (${prev.direction}) on paper, display class, and accent band`);
  }
  if (state.userLast2.length === 2) {
    const [a, b] = state.userLast2;
    const band = hueBand(a.accent_hue_deg);
    if (band === hueBand(b.accent_hue_deg) && traits.band === band)
      issues.push(`the user ledger's last two runs are both accent band ${band}`);
    if (a.paper && a.paper === b.paper && traits.paper === a.paper)
      issues.push(`the user ledger's last two runs are both ${a.paper} paper`);
  }
  const n = state.directionCounts[row.name] || 0;
  if (n >= 3) issues.push(`${row.name} appears ${n} times in the last 8 runs, so it is resting`);
  return issues;
}

function structureIssues(layout, state) {
  const issues = [];
  if (state.recentStructures.includes(layout.name)) issues.push(`${layout.name} is among the last 3 structures`);
  const n = state.structureCounts[layout.name] || 0;
  if (n >= 4) issues.push(`${layout.name} appears ${n} times in the last 8 runs, so it is resting`);
  return issues;
}

// Advance an index by 1 (mod size) until it is legal, recording why each
// skipped index was illegal. A full cycle with nothing legal keeps the roll.
function advance(start, size, issuesAt) {
  const skipped = [];
  for (let k = 0; k < size; k++) {
    const i = (start + k) % size;
    const issues = issuesAt(i);
    if (!issues.length) return { index: i, skipped };
    skipped.push({ index: i, why: issues[0] });
  }
  return { index: start, skipped: [], exhausted: true };
}

// ---------------------------------------------------------------- the pick

const pad = (n) => String(n).padStart(2, '0');
const minuteStamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function rollSeed(project, date) {
  return createHash('sha256').update(`${project}${minuteStamp(date)}`).digest().readUInt32BE(0);
}

export function derive(seed, sizes) {
  return {
    direction: seed % sizes.directions,
    structure: Math.floor(seed / 29) % sizes.layouts,
    palette: Math.floor(seed / 7) % sizes.palettes,
    typepair: Math.floor(seed / 13) % sizes.fonts,
    jitter: {
      h: (Math.floor(seed / 37) % 25) - 12,
      l: (Math.floor(seed / 43) % 3) - 1,
      r: (Math.floor(seed / 47) % 3) - 1,
    },
  };
}

export function pick(decks, { seed, keepDirection = false, reroll = false, project = [], user = [] }) {
  const sizes = Object.fromEntries(Object.entries(decks).map(([k, v]) => [k, v.length]));
  const roll = derive(seed, sizes);
  const state = ledgerState(project, user);
  const notes = [];

  const s = advance(roll.structure, sizes.layouts, (i) => structureIssues(decks.layouts[i], state));
  for (const k of s.skipped) notes.push(`structure ${k.index} ${decks.layouts[k.index].name} skipped: ${k.why}`);
  if (s.exhausted) notes.push('no structure satisfies every ledger rule; the rolled structure stands');

  let direction = null;
  let traits = null;
  if (!keepDirection) {
    const d = advance(roll.direction, sizes.directions,
      (i) => directionIssues(decks.directions[i], rowTraits(decks.directions[i], roll.jitter), state));
    for (const k of d.skipped) notes.push(`direction ${k.index} ${decks.directions[k.index].name} skipped: ${k.why}`);
    if (d.exhausted) notes.push('no direction satisfies every ledger rule; the rolled direction stands');
    let di = d.index;
    if (reroll) {
      const first = rowTraits(decks.directions[di], roll.jitter);
      const r = advance((di + 1) % sizes.directions, sizes.directions, (i) => {
        const t = rowTraits(decks.directions[i], roll.jitter);
        const issues = directionIssues(decks.directions[i], t, state);
        if (t.display === first.display) issues.unshift('same display class');
        if (t.band === first.band) issues.unshift('same accent band');
        return issues;
      });
      notes.push(r.exhausted
        ? 'steering override requested, but no row differs on both display class and accent band; the pick stands'
        : `steering override: rerolled from ${di} ${decks.directions[di].name} to ${r.index} ${decks.directions[r.index].name}, which differs on display class and accent band`);
      if (!r.exhausted) di = r.index;
    }
    direction = decks.directions[di];
    traits = rowTraits(direction, roll.jitter);
  }

  return {
    seed,
    sizes,
    jitter: roll.jitter,
    state,
    notes,
    structure: decks.layouts[s.index],
    direction,
    traits,
    remix: { palette: decks.palettes[roll.palette], typepair: decks.fonts[roll.typepair] },
  };
}

// ---------------------------------------------------------------- rendering

function signed(n) { return n >= 0 ? `+${n}` : String(n); }

function radiusAfterJitter(radius, r) {
  const m = /^(\d+)(px)?(?![\d-])/.exec(radius || '');
  if (!m) return `${radius} (jitter ${signed(r * 2)}px where a single value is stated)`;
  const base = Number(m[1]);
  if (base === 0) return '0 (the row states 0; flatness is its identity, no jitter)';
  return `${Math.max(0, base + r * 2)}px (row ${base}px, jitter ${signed(r * 2)}px)`;
}

function tokenLines(row, jitter) {
  return row.roles.map(({ role, hex }) => {
    if (role === 'accent' && jitter.h) return `  --accent: oklch(from ${hex} l c calc(h ${jitter.h > 0 ? '+' : '-'} ${Math.abs(jitter.h)}));`;
    if ((role === 'bg' || role === 'surface') && jitter.l)
      return `  --${role}: oklch(from ${hex} calc(l ${jitter.l > 0 ? '+' : '-'} 0.01) c h);`;
    return `  --${role}: ${hex};`;
  });
}

function rotationSentence(result) {
  const { state, notes } = result;
  const skips = notes.filter((n) => / skipped: /.test(n));
  if (state.empty) return 'no earlier runs in either ledger; the seed\'s picks stand';
  const recent = state.recentStructures.length ? `recent structures: ${state.recentStructures.join(', ')}` : 'no recent structures';
  return skips.length ? `${recent}; ${skips.join('; ')}` : `${recent}; the seed's picks are legal and stand`;
}

export function render(result, { root = ROOT, date = new Date() } = {}) {
  const { seed, jitter, structure, direction, traits, remix } = result;
  const out = [];
  const pickCmd = `node ${join(root, 'scripts/pick.mjs')}`;
  out.push(`goddesign pick | seed ${seed} | ${result.sizes.directions} directions, ${result.sizes.layouts} structures`);
  out.push('');
  out.push(`ROTATION: ${rotationSentence(result)}.`);
  for (const n of result.notes.filter((n) => !/ skipped: /.test(n))) out.push(`NOTE: ${n}.`);
  out.push('');

  if (direction) {
    out.push(`DIRECTION ${direction.index} ${direction.name} [paper ${traits.paper} | display ${traits.display} | accent ${traits.hue === null ? 'neutral' : `hue ${traits.hue}, ${traits.band}`}]`);
    out.push(direction.body);
    out.push('');
  } else {
    out.push('DIRECTION: taken from the brief (--keep-direction). Lock its tokens in the same format below.');
    out.push('');
  }

  out.push(`STRUCTURE ${structure.index} ${structure.name}`);
  out.push(structure.body);
  out.push('');

  if (direction) {
    out.push(`TOKENS after jitter h${signed(jitter.h)} L${signed(jitter.l)} r${signed(jitter.r)} (paste into :root; the hexes above are the row's archetype):`);
    out.push(...tokenLines(direction, jitter));
    out.push(`  radius: ${radiusAfterJitter(direction.radius, jitter.r)}`);
    out.push('');
  }

  out.push('REMIX, only if the brief pins brand colors or type, or the audience contradicts the row\'s mood (swap by index, never blend):');
  out.push(`  palette ${remix.palette.index} ${remix.palette.name} (${remix.palette.mood})   ${pickCmd} --show palettes:${remix.palette.index}`);
  out.push(`  typepair ${remix.typepair.index} ${remix.typepair.name}   ${pickCmd} --show fonts:${remix.typepair.index}`);
  out.push('');

  const accentLabel = traits ? (traits.hue === null ? 'neutral' : String(traits.hue)) : '<hue or neutral>';
  const directionLabel = direction ? `${direction.index} ${direction.name}` : '<the brief\'s aesthetic>';
  out.push('LOCK (copy it, then fill the three open lines before writing code):');
  out.push('DIRECTION LOCK');
  out.push(`Seed: ${seed} | Structure: ${structure.index} ${structure.name} | Direction: ${directionLabel}`);
  out.push(`Rotation: ${rotationSentence(result)}`);
  if (direction) {
    const five = ['bg', 'surface', 'text', 'muted', 'accent']
      .map((role) => direction.roles.find((r) => r.role === role))
      .filter(Boolean)
      .map(({ role, hex }) => `--${role} ${hex}`);
    out.push(`Tokens: ${five.join(' | ')}`);
    out.push(`Jitter: h${signed(jitter.h)} L${signed(jitter.l)} r${signed(jitter.r)} | accent hue ${traits.baseHue === null ? 'neutral' : `${traits.baseHue} to ${traits.hue}`}`);
    out.push(`Type: ${direction.type}`);
    out.push(`Import: ${direction.import}`);
  } else {
    out.push('Tokens: <five hexes from the brief>');
    out.push('Type: <display / body / labels, named families and weights>');
    out.push('Import: <webfont URL>');
  }
  out.push(`Layout: <fill: ${structure.name} applied to this subject, with a small ASCII sketch>`);
  out.push(`Signature: <fill: an artifact of the subject's world, drawn in this row's form${direction ? `; the row suggests: ${direction.signature}` : ''}>`);
  out.push('Grammar: <fill: (a) band escaping the container | (b) section with no heading ceremony | (c) orphan or spanning cell | (d) uneven section lengths | paddings, 3+ values, largest 2x+ smallest>');
  out.push(`Motion: ${direction ? direction.motion : '<budget>'}`);
  out.push(`Atmosphere: ${direction ? direction.background : '<ground treatment>'}`);
  out.push('');

  out.push('STAMP (first line of the main stylesheet):');
  out.push(`/* goddesign | structure: ${structure.name} | direction: ${direction ? direction.name : '<name>'} | accent: ${accentLabel} */`);
  out.push('');

  const entry = {
    date: isoDate(date),
    structure: structure.name,
    direction: direction ? direction.name : '<name>',
    paper: traits ? traits.paper : '<dark|mid|light>',
    display: traits ? traits.display : '<serif|grotesque|mono|slab|display>',
    accent_hue_deg: traits ? traits.hue : '<0-359 or null>',
    seed,
  };
  out.push('PERSIST (only after the gate passes; edit the entry if the lock changed):');
  out.push(`  ${pickCmd} --log '${JSON.stringify(entry)}'`);
  return { text: out.join('\n'), entry };
}

// ---------------------------------------------------------------- map

// Under a design map the seed rolls once, at charting, into the System lock.
// A map whose System lock already carries a seed is past charting: inherit it.
export function mapSeed(path = '.design-map.md') {
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const lock = /^## System lock\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
  const seed = lock && /^Seed:\s*(\d+)/m.exec(lock[1]);
  return seed ? Number(seed[1]) : null;
}

// ---------------------------------------------------------------- --log

function logEntry(json, opt) {
  let entry;
  try { entry = JSON.parse(json); } catch { usage('--log takes one JSON object'); }
  const problems = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) problems.push('the entry is not an object');
  else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date || '')) problems.push('date must be YYYY-MM-DD');
    for (const f of ['structure', 'direction']) if (typeof entry[f] !== 'string' || !entry[f] || entry[f].startsWith('<')) problems.push(`${f} must be a name`);
    if (!PAPERS.includes(entry.paper)) problems.push(`paper must be one of ${PAPERS.join(', ')}`);
    if (!DISPLAY_CLASSES.includes(entry.display)) problems.push(`display must be one of ${DISPLAY_CLASSES.join(', ')}`);
    const h = entry.accent_hue_deg;
    if (!(h === null || (Number.isFinite(h) && h >= 0 && h < 360))) problems.push('accent_hue_deg must be a number 0-359, or null for a neutral accent');
  }
  if (problems.length) {
    for (const p of problems) console.log(`pick: refused: ${p}`);
    process.exit(1);
  }
  if (existsSync('.design-map.md') && !opt.mapFinal) {
    console.log('pick: refused: a .design-map.md exists. A map writes one ledger entry, only when its last surface locks (verify-map.mjs says when); then re-run with --map-final.');
    process.exit(1);
  }
  const write = (path, keep) => {
    const entries = [...readLedger(path), entry].slice(-keep);
    writeFileSync(path, `${JSON.stringify(entries, null, 2)}\n`);
    return path;
  };
  const written = [write(PROJECT_LEDGER, 20)];
  if (!opt.noUser) written.push(write(userLedgerPath(), 40));
  console.log(`logged to ${written.join(' and ')}: ${JSON.stringify(entry)}`);
}

// ---------------------------------------------------------------- --show

function show(decks, spec) {
  const m = /^(directions|layouts|palettes|fonts):(\d+)$/.exec(spec);
  if (!m) usage('--show takes <directions|layouts|palettes|fonts>:<index>');
  const row = decks[m[1]][Number(m[2])];
  if (!row) usage(`${m[1]} has rows 0-${decks[m[1]].length - 1}`);
  if (m[1] === 'directions') return `## ${row.index}. ${row.name}\n${row.body}`;
  if (m[1] === 'layouts') return `${row.index}. **${row.name}**: ${row.body}`;
  if (m[1] === 'palettes') return `${row.index}. **${row.name}** (${row.mood})\n   ${row.body}`;
  const pattern = /^Import URL pattern.*\n`(.+)`/m.exec(readReference(DECKS.fonts));
  return `| ${row.index} | ${row.display} | ${row.body} | ${row.register} |${pattern ? `\nImport pattern (set the families and weights): ${pattern[1]}` : ''}`;
}

// ---------------------------------------------------------------- --check

function check(decks) {
  const problems = [];
  const skill = (() => { try { return readFileSync(join(ROOT, 'SKILL.md'), 'utf8'); } catch { return ''; } })();
  if (!skill) problems.push('SKILL.md not found');
  const line = skill.split('\n').find((l) => l.includes('direction = N %')) || '';
  const moduli = [...line.matchAll(/% (\d+)/g)].map((m) => Number(m[1])).slice(0, 4);
  const sizes = [decks.directions.length, decks.layouts.length, decks.palettes.length, decks.fonts.length];
  if (moduli.length !== 4) problems.push('SKILL.md no-node fallback line not found (stale or partial copy)');
  else if (moduli.join() !== sizes.join()) problems.push(`SKILL.md no-node fallback rolls % [${moduli}] but the decks hold [${sizes}] rows`);
  if (problems.length) incomplete(problems);
  console.log(`goddesign: install OK (${sizes[0]} directions, ${sizes[1]} structures, ${sizes[2]} palettes, ${sizes[3]} type pairings under ${ROOT})`);
}

// ---------------------------------------------------------------- main

function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.log !== undefined) return logEntry(opt.log, opt);
  const decks = loadDecks();
  if (opt.check) return check(decks);
  if (opt.show) return console.log(show(decks, opt.show));

  const inherited = mapSeed();
  if (inherited !== null) {
    console.log(`MAP: .design-map.md already carries a System lock (seed ${inherited}). Do not roll: inherit that lock verbatim and choose only this surface's Structure, Layout, Signature, and Grammar (references/map.md).`);
    return;
  }

  const project = readLedger(PROJECT_LEDGER);
  const user = readLedger(userLedgerPath());
  const seed = opt.seed ?? rollSeed(basename(process.cwd()), new Date());
  const result = pick(decks, { seed, keepDirection: opt.keepDirection, reroll: opt.reroll, project, user });
  const { text, entry } = render(result);
  if (opt.json) {
    console.log(JSON.stringify({
      seed,
      direction: result.direction ? { index: result.direction.index, name: result.direction.name, ...result.traits } : null,
      structure: { index: result.structure.index, name: result.structure.name },
      jitter: result.jitter,
      remix: { palette: result.remix.palette.index, typepair: result.remix.typepair.index },
      notes: result.notes,
      entry,
    }, null, 2));
    return;
  }
  console.log(text);
}

// Every host installs this skill through a symlink, so compare real paths: a
// plain path comparison makes a symlinked invocation exit 0 having done nothing.
const invokedDirectly = () => {
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
};
if (process.argv[1] && invokedDirectly()) main();
