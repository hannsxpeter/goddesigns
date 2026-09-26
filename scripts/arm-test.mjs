#!/usr/bin/env node
// Harness for the pre-registered lean-core comparison
// (validation/studies/lean-core-2026-09/protocol.md).
//
// Each (brief, arm) cell runs headless Claude Code in a fresh temporary
// workspace with --safe-mode, so no CLAUDE.md, installed skill, plugin, hook,
// or MCP server loads. A skill arm receives its tagged SKILL.md the way a host
// loads a skill: appended to the system prompt with its base directory, plus
// read access to that directory. The harness then measures every page with the
// current gate scripts, builds a blind pack for the owner to rank, and applies
// the pre-registered criteria mechanically once the ranking exists.
//
// Usage:
//   node scripts/arm-test.mjs plan   [--study <dir>]
//   node scripts/arm-test.mjs run    [--study <dir>] [--arms A,B] [--briefs L01,L02]
//                                    [--skill-ref WORKTREE] [--force] [--dry-run]
//   node scripts/arm-test.mjs pack   [--study <dir>] [--allow-missing]
//   node scripts/arm-test.mjs reveal [--study <dir>]
//
// --skill-ref replaces every arm's tagged skill with another git ref, or with
// WORKTREE (the current skills/goddesign), for smoke tests before tagging.
// Prerequisite for run: `claude auth status` reports loggedIn true.
// Exit codes: 0 ok, 1 a cell or step failed, 2 usage error.

import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SWEEP = join(REPO, 'skills/goddesign/scripts/sweep.mjs');
const AUDIT = join(REPO, 'skills/goddesign/scripts/audit.mjs');
const DEFAULT_STUDY = join(REPO, 'validation/studies/lean-core-2026-09');
const SCOPE = 'Work only in the current directory. Deliver index.html; a sibling stylesheet is fine. Do not create frameworks, package files, or documentation. Do not use subagents. Do not use em dash or en dash characters, and do not use emojis.';
const HOME_LEDGER = join(homedir(), '.design-log.json');
const PARKED_LEDGER = `${HOME_LEDGER}.arm-test-parked`;

// ---------------------------------------------------------------- arguments

function usage(message) {
  if (message) console.error(`arm-test: ${message}`);
  console.error('usage: node scripts/arm-test.mjs <plan|run|pack|reveal> [--study <dir>] [--arms A,B] [--briefs L01] [--skill-ref <ref>] [--force] [--dry-run] [--allow-missing]');
  process.exit(2);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!['plan', 'run', 'pack', 'reveal'].includes(command)) usage(command ? `unknown command ${command}` : 'no command');
  const opt = { command, study: DEFAULT_STUDY, force: false, dryRun: false, allowMissing: false };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    const value = () => (i + 1 < rest.length ? rest[++i] : usage(`${a} needs a value`));
    if (a === '--study') opt.study = resolve(value());
    else if (a === '--arms') opt.arms = value().split(',');
    else if (a === '--briefs') opt.briefs = value().split(',');
    else if (a === '--skill-ref') opt.skillRef = value();
    else if (a === '--force') opt.force = true;
    else if (a === '--dry-run') opt.dryRun = true;
    else if (a === '--allow-missing') opt.allowMissing = true;
    else usage(`unknown argument ${a}`);
  }
  return opt;
}

// ---------------------------------------------------------------- study

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function loadStudy(dir) {
  const arms = readJson(join(dir, 'arms.json'));
  const briefs = readJson(join(dir, 'briefs.json'));
  return { dir, work: join(dir, 'work'), ...arms, briefs: briefs.briefs };
}

export function cellsOf(study, opt = {}) {
  const cells = [];
  for (const brief of study.briefs) {
    if (opt.briefs && !opt.briefs.includes(brief.id)) continue;
    for (const arm of study.arms) {
      if (opt.arms && !opt.arms.includes(arm.id)) continue;
      cells.push({ id: `${brief.id}-${arm.id}`, brief, arm });
    }
  }
  return cells;
}

const runDir = (study, cell) => join(study.work, 'runs', cell.id);

// ---------------------------------------------------------------- one run

export function loaderPrompt(root) {
  const skill = readFileSync(join(root, 'SKILL.md'), 'utf8');
  return [
    `The goddesign skill is installed for this session. Base directory for this skill: ${root}`,
    'When the user\'s message starts with /goddesign, the text after it is the brief: follow the skill below. Its references and scripts are under the base directory.',
    '',
    skill,
  ].join('\n');
}

export function commandFor(cell, study, root) {
  const args = ['-p', '--safe-mode', '--model', cell.arm.model, '--effort', study.effort,
    '--permission-mode', 'bypassPermissions', '--no-session-persistence', '--output-format', 'json',
    '--max-budget-usd', String(study.budget_usd_per_run)];
  // --add-dir is variadic, so a single-valued option must follow it.
  if (root) args.push('--add-dir', root, '--append-system-prompt', loaderPrompt(root));
  const prompt = `${root ? '/goddesign ' : ''}${cell.brief.brief}\n\n${SCOPE}`;
  return { command: 'claude', args, prompt };
}

function skillRoot(ref, cache) {
  if (cache.has(ref)) return cache.get(ref);
  const dest = mkdtempSync(join(tmpdir(), `arm-skill-${ref.replace(/[^\w.-]/g, '_')}-`));
  if (ref === 'WORKTREE') {
    cpSync(join(REPO, 'skills/goddesign'), join(dest, 'skills/goddesign'), { recursive: true });
  } else {
    const ok = spawnSync('git', ['-C', REPO, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`]).status === 0;
    if (!ok) throw new Error(`git ref ${ref} not found: tag it first, or pass --skill-ref WORKTREE for a smoke test`);
    const tar = spawnSync('sh', ['-c', 'git -C "$1" archive --format=tar "$2" skills/goddesign | tar -x -C "$3"', 'sh', REPO, ref, dest]);
    if (tar.status !== 0) throw new Error(`could not extract skills/goddesign at ${ref}: ${tar.stderr}`);
  }
  const root = join(dest, 'skills/goddesign');
  cache.set(ref, root);
  return root;
}

// v1.8.0 reads ~/.design-log.json directly, so each run parks the owner's
// ledger and restores it afterwards; whatever a run wrote there is kept as
// evidence in the run directory, never merged into the owner's ledger.
function parkLedger() {
  if (existsSync(PARKED_LEDGER)) throw new Error(`${PARKED_LEDGER} exists: a previous run did not restore it. Move it back to ${HOME_LEDGER} by hand first.`);
  if (existsSync(HOME_LEDGER)) renameSync(HOME_LEDGER, PARKED_LEDGER);
}
function restoreLedger(dir) {
  if (existsSync(HOME_LEDGER)) {
    if (dir) copyFileSync(HOME_LEDGER, join(dir, 'home-ledger-written.json'));
    rmSync(HOME_LEDGER);
  }
  if (existsSync(PARKED_LEDGER)) renameSync(PARKED_LEDGER, HOME_LEDGER);
}

function execute({ command, args, prompt }, { cwd, env, timeoutMs }) {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 10000).unref();
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (e) => { stderr += String(e); });
    child.on('close', (code) => { clearTimeout(timer); done({ code, stdout, stderr, timedOut }); });
    child.stdin.end(prompt);
  });
}

function copyPage(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    if (['node_modules', '.git'].includes(entry)) continue;
    const src = join(from, entry);
    const st = statSync(src);
    if (st.isDirectory()) copyPage(src, join(to, entry));
    else if (st.size <= 5 * 1024 * 1024) copyFileSync(src, join(to, entry));
  }
}

function measure(dir) {
  const page = join(dir, 'page');
  const hasIndex = existsSync(join(page, 'index.html'));
  const sweep = spawnSync(process.execPath, [SWEEP, page, '--json'], { encoding: 'utf8' });
  let findings = [];
  try { findings = JSON.parse(sweep.stdout).findings || []; } catch { /* nothing scannable */ }
  const failures = findings.filter((f) => f.severity === 'fail' && f.rule !== 'no-stamp');
  const audit = hasIndex
    ? spawnSync(process.execPath, [AUDIT, join('page', 'index.html')], { cwd: dir, encoding: 'utf8', timeout: 300000 })
    : { status: null, stdout: '' };
  writeFileSync(join(dir, 'sweep.json'), sweep.stdout || '{}');
  writeFileSync(join(dir, 'audit.json'), audit.stdout || '{}');
  const html = ['index.html', ...readdirSyncSafe(page).filter((f) => f.endsWith('.css'))]
    .map((f) => { try { return readFileSync(join(page, f), 'utf8'); } catch { return ''; } }).join('\n');
  const stamp = /goddesign\s*\|[^*]*?direction:\s*([^|*\n]+)/i.exec(html);
  return {
    has_index: hasIndex,
    sweep: { exit: sweep.status, failures_excluding_no_stamp: failures.length, rules: [...new Set(failures.map((f) => f.rule))] },
    audit: { exit: audit.status },
    direction: stamp ? stamp[1].trim() : null,
  };
}
const readdirSyncSafe = (d) => { try { return readdirSync(d); } catch { return []; } };

function summarize(stdout) {
  let j = {};
  try { j = JSON.parse(stdout); } catch { return { parsed: false }; }
  const u = j.usage || {};
  return {
    parsed: true,
    is_error: Boolean(j.is_error),
    subtype: j.subtype ?? null,
    result_excerpt: typeof j.result === 'string' ? j.result.slice(0, 400) : null,
    total_cost_usd: j.total_cost_usd ?? null,
    num_turns: j.num_turns ?? null,
    duration_ms: j.duration_ms ?? null,
    models: Object.keys(j.modelUsage || {}),
    tokens: {
      input: u.input_tokens ?? 0,
      output: u.output_tokens ?? 0,
      cache_read: u.cache_read_input_tokens ?? 0,
      cache_write: u.cache_creation_input_tokens ?? 0,
    },
  };
}

function checkLogin() {
  const r = spawnSync('claude', ['auth', 'status'], { encoding: 'utf8' });
  let status = {};
  try { status = JSON.parse(r.stdout); } catch { /* reported below */ }
  if (r.error || !status.loggedIn) {
    console.error('arm-test: the claude CLI is not logged in, so headless runs cannot start. Run `claude auth login` once in a terminal, then re-run. (A desktop-app login does not carry over to `claude -p`.)');
    process.exit(1);
  }
}

async function runCells(study, opt) {
  const cells = cellsOf(study, opt);
  const cache = new Map();
  const tmpRoot = mkdtempSync(join(tmpdir(), 'arm-test-'));
  if (!opt.dryRun) checkLogin();
  let failed = 0;
  let active = null;
  const bail = () => { if (active) restoreLedger(active); process.exit(130); };
  process.on('SIGINT', bail);
  process.on('SIGTERM', bail);
  for (const cell of cells) {
    const dir = runDir(study, cell);
    if (!opt.dryRun && existsSync(join(dir, 'meta.json')) && !opt.force) {
      console.log(`[${cell.id}] done already; --force re-runs it`);
      continue;
    }
    const ref = cell.arm.skill ? (opt.skillRef || cell.arm.skill) : null;
    const root = ref ? skillRoot(ref, cache) : null;
    const cmd = commandFor(cell, study, root);
    if (opt.dryRun) {
      const shown = cmd.args.map((a) => (a.length > 120 ? `<${a.length} chars: loader + ${ref} SKILL.md>` : a));
      console.log(`[${cell.id}] ${cmd.command} ${shown.join(' ')}  <<< ${cmd.prompt.slice(0, 60).replace(/\n/g, ' ')}...`);
      continue;
    }
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const workspace = mkdtempSync(join(tmpdir(), 'arm-ws-'));
    const env = { ...process.env, GODDESIGN_USER_LEDGER: join(tmpRoot, `user-ledger-${cell.id}.json`) };
    console.log(`[${cell.id}] running: ${cell.arm.model}, ${ref ? `skill ${ref}` : 'no skill'}`);
    const started = new Date();
    parkLedger();
    active = dir;
    let res;
    try {
      res = await execute(cmd, { cwd: workspace, env, timeoutMs: study.timeout_minutes * 60000 });
    } finally {
      restoreLedger(dir);
      active = null;
    }
    writeFileSync(join(dir, 'result.json'), res.stdout);
    writeFileSync(join(dir, 'stderr.log'), res.stderr);
    copyPage(workspace, join(dir, 'page'));
    rmSync(workspace, { recursive: true, force: true });
    const meta = {
      cell: cell.id,
      brief: cell.brief.id,
      arm: cell.arm.id,
      label: cell.arm.label,
      model_alias: cell.arm.model,
      effort: study.effort,
      skill_ref: ref,
      started_at: started.toISOString(),
      wall_ms: Date.now() - started.getTime(),
      exit_code: res.code,
      timed_out: res.timedOut,
      run: summarize(res.stdout),
      ...measure(dir),
    };
    writeFileSync(join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
    if (res.code !== 0 || !meta.has_index) failed++;
    const cost = meta.run.total_cost_usd == null ? 'cost unknown' : `$${meta.run.total_cost_usd.toFixed(2)}`;
    console.log(`[${cell.id}] ${meta.has_index ? 'page written' : 'NO PAGE'}, ${Math.round(meta.wall_ms / 60000)} min, ${cost}, audit exit ${meta.audit.exit}`);
  }
  rmSync(tmpRoot, { recursive: true, force: true });
  return failed;
}

// ---------------------------------------------------------------- pack

const newCode = (used) => {
  for (;;) {
    const code = [...randomBytes(4)].map((b) => String.fromCharCode(65 + (b % 26))).join('');
    if (!used.has(code)) { used.add(code); return code; }
  }
};

export function pack(study, opt = {}) {
  const cells = cellsOf(study);
  const missing = cells.filter((c) => !existsSync(join(runDir(study, c), 'meta.json')));
  if (missing.length && !opt.allowMissing) throw new Error(`cells not run yet: ${missing.map((c) => c.id).join(', ')} (or pass --allow-missing)`);
  const out = join(study.work, 'pack');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const used = new Set();
  const key = {};
  const lines = [
    '# Blind ranking',
    '',
    'For each brief, rank its pages from best to worst on one question: which would you ship?',
    'Write the codes, best first, into `ranking.json`. Rank before opening `../runs/` or `../sealed/`: arms and costs are visible there.',
    '',
  ];
  for (const brief of study.briefs) {
    const entries = cells.filter((c) => c.brief.id === brief.id && !missing.includes(c));
    const shuffled = entries.map((c) => ({ c, r: randomBytes(4).readUInt32BE(0) })).sort((a, b) => a.r - b.r).map((x) => x.c);
    mkdirSync(join(out, brief.id), { recursive: true });
    key[brief.id] = {};
    lines.push(`## ${brief.id}`, '', brief.brief, '');
    for (const cell of shuffled) {
      const code = newCode(used);
      key[brief.id][code] = cell.arm.id;
      const dir = runDir(study, cell);
      const shots = [['audit-1280.png', `${code}.png`], ['audit-375.png', `${code}-375.png`]];
      const present = shots.filter(([from]) => existsSync(join(dir, from)));
      for (const [from, to] of present) copyFileSync(join(dir, from), join(out, brief.id, to));
      lines.push(`### ${code}`, '');
      lines.push(present.length ? `![${code} at 1280](${brief.id}/${code}.png)\n\n![${code} at 375](${brief.id}/${code}-375.png)` : 'This run produced no renderable page. Rank it last.', '');
    }
  }
  writeFileSync(join(out, 'RANK.md'), `${lines.join('\n')}\n`);
  const template = Object.fromEntries(study.briefs.map((b) => [b.id, []]));
  writeFileSync(join(out, 'ranking.json'), `${JSON.stringify(template, null, 2)}\n`);
  mkdirSync(join(study.work, 'sealed'), { recursive: true });
  writeFileSync(join(study.work, 'sealed', 'key.json'), `${JSON.stringify(key, null, 2)}\n`);
  return { out, key };
}

// ---------------------------------------------------------------- reveal

const median = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

export function decide(ranks, briefIds, costs) {
  const need = Math.ceil(briefIds.length * 0.8);
  const beats = (x, y) => briefIds.filter((b) => ranks[b]?.[x] !== undefined && ranks[b]?.[y] !== undefined && ranks[b][x] < ranks[b][y]).length;
  const better = (x, y) => beats(x, y) >= need;
  const has = (arm) => briefIds.every((b) => ranks[b]?.[arm] !== undefined);
  const out = { need, pairs: {}, criteria: {} };
  for (const [x, y] of [['B', 'A'], ['A', 'B'], ['C', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'C']]) out.pairs[`${x}>${y}`] = beats(x, y);
  out.criteria.design_layer = !has('A') || !has('B') ? 'not evaluable'
    : better('B', 'A') ? 'B is better than A: the lean core stays for frontier models'
      : 'B is not better than A: the design layer retires for frontier models (scripts plus the Banned list only)';
  out.criteria.lean_vs_full = !has('B') || !has('C') ? 'not evaluable'
    : better('C', 'B') ? 'C is better than B: the v1.8.0 enumeration returns to the frontier lane'
      : 'C is not better than B: the lean core stands as shipped';
  const cheap = costs.D != null && costs.C != null && costs.D <= costs.C / 2;
  out.criteria.cheaper_tier = !has('C') || !has('D') ? 'not evaluable'
    : !better('C', 'D') && cheap ? 'C is not better than D and D costs at most half: recommend the cheaper tier with the full lane'
      : `${better('C', 'D') ? 'C is better than D' : 'D costs more than half of C'}: the full lane stays a fallback for literal and smaller models`;
  return out;
}

export function reveal(study) {
  const ranking = readJson(join(study.work, 'pack', 'ranking.json'));
  const key = readJson(join(study.work, 'sealed', 'key.json'));
  const ranks = {};
  for (const [brief, codes] of Object.entries(key)) {
    const order = ranking[brief];
    const expected = Object.keys(codes).sort();
    if (!Array.isArray(order) || [...order].sort().join() !== expected.join())
      throw new Error(`ranking.json ${brief} must list exactly ${expected.join(', ')}, best first`);
    ranks[brief] = Object.fromEntries(order.map((code, i) => [codes[code], i + 1]));
  }
  const metas = cellsOf(study).map((c) => {
    const p = join(runDir(study, c), 'meta.json');
    return existsSync(p) ? readJson(p) : null;
  }).filter(Boolean);
  const byArm = Object.fromEntries(study.arms.map((a) => [a.id, metas.filter((m) => m.arm === a.id)]));
  const costs = Object.fromEntries(Object.entries(byArm).map(([a, ms]) => [a, median(ms.map((m) => m.run?.total_cost_usd))]));
  const briefIds = Object.keys(key);
  const decision = decide(ranks, briefIds, costs);
  const arms = study.arms.map((a) => {
    const ms = byArm[a.id];
    const tokens = (m) => (m.run?.tokens ? Object.values(m.run.tokens).reduce((s, n) => s + n, 0) : null);
    return {
      id: a.id,
      label: a.label,
      models_used: [...new Set(ms.flatMap((m) => m.run?.models || []))],
      mean_rank: briefIds.length ? briefIds.reduce((s, b) => s + (ranks[b][a.id] ?? 0), 0) / briefIds.length : null,
      median_cost_usd: costs[a.id],
      total_cost_usd: ms.reduce((s, m) => s + (m.run?.total_cost_usd ?? 0), 0),
      median_tokens: median(ms.map(tokens)),
      median_turns: median(ms.map((m) => m.run?.num_turns)),
      median_wall_minutes: median(ms.map((m) => m.wall_ms / 60000)),
      audit_green: ms.filter((m) => m.audit?.exit === 0).length,
      sweep_failures_excluding_no_stamp: ms.map((m) => m.sweep?.failures_excluding_no_stamp ?? null),
      directions: ms.map((m) => m.direction).filter(Boolean),
      runs: ms.length,
    };
  });
  const results = { study: study.study, revealed_at: new Date().toISOString(), ranks, decision, arms };
  writeFileSync(join(study.dir, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
  const md = [
    '# Lean-core comparison: results',
    '',
    `Revealed ${results.revealed_at.slice(0, 10)}. Criteria and thresholds are the ones frozen in \`protocol.md\`; "better" means ranked higher on at least ${decision.need} of ${briefIds.length} briefs.`,
    '',
    '## Decisions',
    '',
    `1. ${decision.criteria.design_layer}.`,
    `2. ${decision.criteria.lean_vs_full}.`,
    `3. ${decision.criteria.cheaper_tier}.`,
    '',
    '## Per arm',
    '',
    '| Arm | Models used | Mean rank | Median cost | Median tokens | Median turns | Audit green | Directions |',
    '|---|---|---|---|---|---|---|---|',
    ...arms.map((a) => `| ${a.id} ${a.label} | ${a.models_used.join(', ') || 'unknown'} | ${a.mean_rank?.toFixed(2) ?? 'n/a'} | ${a.median_cost_usd == null ? 'n/a' : `$${a.median_cost_usd.toFixed(2)}`} | ${a.median_tokens ?? 'n/a'} | ${a.median_turns ?? 'n/a'} | ${a.audit_green}/${a.runs} | ${a.directions.join(', ') || 'none'} |`),
    '',
    '## Pairwise wins',
    '',
    ...Object.entries(decision.pairs).map(([k, v]) => `- ${k}: ${v} of ${briefIds.length}`),
    '',
  ];
  writeFileSync(join(study.dir, 'RESULTS.md'), `${md.join('\n')}\n`);
  return results;
}

// ---------------------------------------------------------------- main

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  const study = loadStudy(opt.study);
  if (opt.command === 'plan') {
    for (const cell of cellsOf(study, opt)) {
      const done = existsSync(join(runDir(study, cell), 'meta.json'));
      console.log(`${cell.id}\t${done ? 'done' : 'pending'}\t${cell.arm.model}\t${cell.arm.skill ?? 'no skill'}`);
    }
    return 0;
  }
  if (opt.command === 'run') return (await runCells(study, opt)) ? 1 : 0;
  if (opt.command === 'pack') {
    const { out } = pack(study, opt);
    console.log(`blind pack written to ${out}: read RANK.md, fill ranking.json, then run reveal`);
    return 0;
  }
  const results = reveal(study);
  for (const line of Object.values(results.decision.criteria)) console.log(`- ${line}`);
  console.log(`written: ${join(study.dir, 'RESULTS.md')} and results.json`);
  return 0;
}

const invokedDirectly = () => {
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
};
if (process.argv[1] && invokedDirectly()) {
  main().then((code) => process.exit(code), (e) => { console.error(`arm-test: ${e.message}`); process.exit(1); });
}
