// Tests for scripts/arm-test.mjs, the lean-core comparison harness.
// Run: node --test scripts/arm-test.test.mjs
//
// Nothing here calls a model. The tests pin what makes the comparison fair and
// blind: every arm runs with --safe-mode, only skill arms get a skill, the blind
// pack leaks no arm, and the pre-registered criteria apply exactly as frozen.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { cellsOf, commandFor, decide, loadStudy, pack, reveal } from './arm-test.mjs';

const STUDY = resolve('validation/studies/lean-core-2026-09');
const HARNESS = resolve('scripts/arm-test.mjs');
const study = loadStudy(STUDY);

test('the frozen study is 5 briefs by 4 arms', () => {
  assert.equal(study.briefs.length, 5);
  assert.deepEqual(study.arms.map((a) => a.id), ['A', 'B', 'C', 'D']);
  assert.equal(cellsOf(study).length, 20);
  assert.deepEqual(study.arms.map((a) => a.skill), [null, 'v2.0.0', 'v1.8.0', 'v2.0.0']);
});

test('the briefs are Study A\'s frozen text, verbatim', () => {
  const source = JSON.parse(readFileSync('validation/studies/study-a-2026-07/briefs.json', 'utf8')).briefs;
  for (const b of study.briefs) {
    const from = source.find((s) => s.id === b.source.split(' ')[1]);
    assert.equal(b.brief, from.brief, b.id);
  }
});

test('every arm runs with --safe-mode; only skill arms receive a skill', () => {
  const [a, b] = cellsOf(study, { briefs: ['L01'], arms: ['A', 'B'] });
  const plain = commandFor(a, study, null);
  assert.ok(plain.args.includes('--safe-mode'));
  assert.ok(!plain.args.includes('--append-system-prompt') && !plain.args.includes('--add-dir'));
  assert.ok(!plain.prompt.startsWith('/goddesign'));

  const root = resolve('skills/goddesign');
  const skilled = commandFor(b, study, root);
  assert.ok(skilled.args.includes('--safe-mode'));
  assert.ok(skilled.prompt.startsWith('/goddesign Build a production-quality'));
  // --add-dir is variadic: a single-valued option must follow it, or the next
  // positional would be swallowed as another directory.
  const i = skilled.args.indexOf('--add-dir');
  assert.equal(skilled.args[i + 1], root);
  assert.equal(skilled.args[i + 2], '--append-system-prompt');
  assert.match(skilled.args[i + 3], /^The goddesign skill is installed for this session\. Base directory for this skill: /);
  assert.match(skilled.args[i + 3], /^name: goddesign$/m);
});

test('the dry run plans all twenty cells without touching a model or the ledger', () => {
  const r = spawnSync(process.execPath, [HARNESS, 'run', '--dry-run', '--skill-ref', 'WORKTREE'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split('\n');
  assert.equal(lines.length, 20);
  assert.match(lines.find((l) => l.startsWith('[L03-D]')), /--model sonnet/);
  assert.ok(lines.every((l) => l.includes('--safe-mode')));
});

test('an untagged skill ref stops the run instead of guessing', () => {
  const r = spawnSync(process.execPath, [HARNESS, 'run', '--dry-run', '--arms', 'B', '--skill-ref', 'no-such-ref-v9'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /git ref no-such-ref-v9 not found/);
});

// ---------------------------------------------------------------- pack and reveal

const fixtureStudy = () => {
  const dir = mkdtempSync(join(tmpdir(), 'arm-study-'));
  writeFileSync(join(dir, 'arms.json'), readFileSync(join(STUDY, 'arms.json')));
  writeFileSync(join(dir, 'briefs.json'), readFileSync(join(STUDY, 'briefs.json')));
  const s = loadStudy(dir);
  const cost = { A: 2, B: 3, C: 9, D: 4 };
  for (const cell of cellsOf(s)) {
    const run = join(s.work, 'runs', cell.id);
    mkdirSync(run, { recursive: true });
    writeFileSync(join(run, 'audit-1280.png'), `png ${cell.id}`);
    writeFileSync(join(run, 'audit-375.png'), `png ${cell.id} mobile`);
    writeFileSync(join(run, 'meta.json'), JSON.stringify({
      cell: cell.id, brief: cell.brief.id, arm: cell.arm.id, wall_ms: 600000,
      run: { total_cost_usd: cost[cell.arm.id], num_turns: 30, models: [`model-${cell.arm.model}`], tokens: { input: 1, output: 2, cache_read: 3, cache_write: 4 } },
      audit: { exit: 0 }, sweep: { failures_excluding_no_stamp: 0 }, direction: cell.arm.skill ? 'Swiss International' : null,
    }));
  }
  return s;
};

test('the blind pack names no arm, model, or skill, and the sealed key maps every code back', () => {
  const s = fixtureStudy();
  const { out, key } = pack(s);
  const rank = readFileSync(join(out, 'RANK.md'), 'utf8');
  for (const leak of ['v1.8.0', 'v2.0.0', 'no skill', 'opus', 'sonnet', 'lean core', 'arm A', 'goddesign'])
    assert.ok(!rank.includes(leak), `RANK.md leaks "${leak}"`);
  const codes = Object.values(key).flatMap((m) => Object.keys(m));
  assert.equal(codes.length, 20);
  assert.equal(new Set(codes).size, 20, 'codes are unique');
  for (const [brief, map] of Object.entries(key)) {
    assert.deepEqual(Object.values(map).sort(), ['A', 'B', 'C', 'D']);
    for (const code of Object.keys(map)) {
      assert.ok(existsSync(join(out, brief, `${code}.png`)));
      assert.equal(readFileSync(join(out, brief, `${code}.png`), 'utf8'), `png ${brief}-${map[code]}`);
    }
  }
  assert.ok(readdirSync(out).every((f) => !/[ABCD]\.png$/.test(f)));
  rmSync(s.dir, { recursive: true, force: true });
});

test('reveal applies the frozen criteria: 4 of 5 decides, and cost gates the cheaper tier', () => {
  const s = fixtureStudy();
  const { key } = pack(s);
  // Rank per brief: B, D, C, A on four briefs, and A, C, B, D on the fifth.
  const order = (brief, arms) => arms.map((arm) => Object.keys(key[brief]).find((c) => key[brief][c] === arm));
  const ranking = {};
  s.briefs.forEach((b, i) => { ranking[b.id] = order(b.id, i === 4 ? ['A', 'C', 'B', 'D'] : ['B', 'D', 'C', 'A']); });
  writeFileSync(join(s.work, 'pack', 'ranking.json'), JSON.stringify(ranking));
  const results = reveal(s);
  assert.equal(results.decision.pairs['B>A'], 4);
  assert.match(results.decision.criteria.design_layer, /^B is better than A: the lean core stays/);
  assert.match(results.decision.criteria.lean_vs_full, /^C is not better than B: the lean core stands/);
  assert.match(results.decision.criteria.cheaper_tier, /^C is not better than D and D costs at most half/);
  assert.ok(existsSync(join(s.dir, 'RESULTS.md')));
  rmSync(s.dir, { recursive: true, force: true });
});

test('three wins of five is not "better", and a pricey cheap tier does not win', () => {
  const briefs = ['L01', 'L02', 'L03', 'L04', 'L05'];
  // B beats A on 3 of 5; C beats D on 3 of 5, so neither pair is decided by rank.
  const ranks = Object.fromEntries(briefs.map((b, i) => [b, i < 3 ? { A: 2, B: 1, C: 3, D: 4 } : { A: 1, B: 2, C: 4, D: 3 }]));
  const d = decide(ranks, briefs, { C: 8, D: 5 });
  assert.equal(d.pairs['B>A'], 3);
  assert.equal(d.pairs['C>D'], 3);
  assert.match(d.criteria.design_layer, /^B is not better than A: the design layer retires/);
  assert.match(d.criteria.cheaper_tier, /^D costs more than half of C/);
});

test('reveal refuses a ranking that skips or repeats a code', () => {
  const s = fixtureStudy();
  const { key } = pack(s);
  const ranking = Object.fromEntries(Object.entries(key).map(([b, m]) => [b, Object.keys(m)]));
  ranking.L02 = ranking.L02.slice(0, 3);
  writeFileSync(join(s.work, 'pack', 'ranking.json'), JSON.stringify(ranking));
  assert.throws(() => reveal(s), /ranking\.json L02 must list exactly/);
  rmSync(s.dir, { recursive: true, force: true });
});
