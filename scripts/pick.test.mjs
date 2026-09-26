// Tests for skills/goddesign/scripts/pick.mjs, the variance engine.
// Run: node --test scripts/pick.test.mjs
//
// The receipts come from real runs: validation/runs/bellweather-2026-08/README.md
// recorded seed 2110904443 rolling direction 10 Playful Pop, advancing to 11
// Luxury Serif because the user ledger's last two runs were light paper, and
// landing on structure 4 Workbench with jitter h+9. The model did that by hand;
// the script has to make the same call.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { derive, hexToOklch, hueBand, ledgerState, loadDecks, pick } from '../skills/goddesign/scripts/pick.mjs';

const SKILL = resolve('skills/goddesign');
const PICK = join(SKILL, 'scripts/pick.mjs');
const decks = loadDecks();
const sizes = { directions: decks.directions.length, layouts: decks.layouts.length, palettes: decks.palettes.length, fonts: decks.fonts.length };

const workspace = () => mkdtempSync(join(tmpdir(), 'goddesign-pick-'));
const run = (args, cwd, env = {}) => {
  const r = spawnSync(process.execPath, [PICK, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GODDESIGN_USER_LEDGER: join(cwd, 'user-ledger.json'), ...env },
  });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
};
const entry = (over = {}) => ({ date: '2026-08-01', structure: 'Letter', direction: 'Swiss International', paper: 'light', display: 'grotesque', accent_hue_deg: 36, ...over });

// ---------------------------------------------------------------- decks and color

test('the real install passes --check', () => {
  const dir = workspace();
  const r = run(['--check'], dir);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /install OK \(17 directions, 12 structures, 10 palettes, 12 type pairings/);
  rmSync(dir, { recursive: true, force: true });
});

test('every direction row parses completely, with a display class', () => {
  assert.equal(decks.directions.length, 17);
  for (const row of decks.directions) {
    assert.ok(row.bg && row.surface && row.accent, `row ${row.index} hexes`);
    assert.ok(['serif', 'grotesque', 'mono', 'slab', 'display'].includes(row.display), `row ${row.index} class`);
    assert.ok(row.import.startsWith('https://fonts.googleapis.com/'), `row ${row.index} import`);
  }
});

test('hexToOklch matches the hues the evaluation records measured', () => {
  // banned-list-mechanization-2026-08.md: row 12's #2B4BFF sits at hue 267.1.
  assert.equal(Math.round(hexToOklch('#2B4BFF').H * 10) / 10, 267.1);
  // bellweather-2026-08: Luxury Serif's platinum accent is neutral at chroma 0.0166.
  assert.ok(hexToOklch('#C9CFDA').C < 0.02);
  assert.equal(hueBand(null), 'neutral');
  assert.equal(hueBand(36), 'warm');
  assert.equal(hueBand(250), 'cool');
  assert.equal(hueBand(150), 'other');
});

// ---------------------------------------------------------------- the roll

test('seed derivation carries over from the shell seed: the bellweather receipt', () => {
  const roll = derive(2110904443, sizes);
  assert.equal(roll.direction, 10);
  assert.equal(roll.structure, 4);
  assert.deepEqual(roll.jitter, { h: 9, l: 0, r: 0 });
});

test('an empty ledger keeps the seed\'s picks', () => {
  const r = pick(decks, { seed: 2110904443 });
  assert.equal(r.direction.name, 'Playful Pop');
  assert.equal(r.structure.name, 'Workbench');
  assert.deepEqual(r.notes, []);
});

test('two light-paper runs in the user ledger push the pick off light paper, as bellweather did by hand', () => {
  const user = [entry(), entry({ structure: 'Manifesto', direction: 'Lo-Fi Riso', display: 'slab', accent_hue_deg: 250 })];
  const r = pick(decks, { seed: 2110904443, user });
  assert.equal(r.direction.index, 11);
  assert.equal(r.direction.name, 'Luxury Serif');
  assert.match(r.notes[0], /direction 10 Playful Pop skipped: the user ledger's last two runs are both light paper/);
});

test('the structure may not repeat any of the last 3', () => {
  const project = [entry({ structure: 'Workbench' })];
  const r = pick(decks, { seed: 2110904443, project });
  assert.notEqual(r.structure.name, 'Workbench');
  assert.equal(r.structure.index, 5);
});

test('a direction identical to the previous run on all three axes is skipped', () => {
  const t = pick(decks, { seed: 2110904443 }).traits;
  const project = [entry({ structure: 'Letter', direction: 'Anything', paper: t.paper, display: t.display, accent_hue_deg: t.hue })];
  const r = pick(decks, { seed: 2110904443, project });
  assert.notEqual(r.direction.name, 'Playful Pop');
});

test('the popularity cap rests a direction seen 3 times in the last 8 runs', () => {
  const project = [0, 1, 2].map((i) => entry({ structure: ['Letter', 'Specimen', 'Catalogue'][i], direction: 'Playful Pop', paper: 'mid', display: 'mono', accent_hue_deg: 150 }));
  const r = pick(decks, { seed: 2110904443, project });
  assert.notEqual(r.direction.name, 'Playful Pop');
  assert.ok(r.notes.some((n) => /resting/.test(n)));
});

test('one run logged to both ledgers counts once toward the cap', () => {
  const run = entry({ direction: 'Playful Pop' });
  const state = ledgerState([run, { ...run, date: '2026-08-02' }], [run, { ...run, date: '2026-08-02' }]);
  assert.equal(state.directionCounts['Playful Pop'], 2);
});

test('--reroll changes both the display class and the accent band', () => {
  const first = pick(decks, { seed: 2110904443 });
  const r = pick(decks, { seed: 2110904443, reroll: true });
  assert.notEqual(r.traits.display, first.traits.display);
  assert.notEqual(r.traits.band, first.traits.band);
  assert.ok(r.notes.some((n) => /steering override: rerolled/.test(n)));
});

test('--keep-direction rolls the structure only', () => {
  const r = pick(decks, { seed: 2110904443, keepDirection: true });
  assert.equal(r.direction, null);
  assert.equal(r.structure.name, 'Workbench');
});

// ---------------------------------------------------------------- the CLI

test('the printed lock carries the stamp and a ready --log command', () => {
  const dir = workspace();
  const r = run(['--seed', '2110904443'], dir);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^DIRECTION LOCK$/m);
  assert.match(r.out, /^Seed: 2110904443 \| Structure: 4 Workbench \| Direction: 10 Playful Pop$/m);
  assert.match(r.out, /\/\* goddesign \| structure: Workbench \| direction: Playful Pop \| accent: 24 \*\//);
  assert.match(r.out, /--accent: oklch\(from #FF4D6D l c calc\(h \+ 9\)\);/);
  assert.match(r.out, /pick\.mjs --log '\{"date":"\d{4}-\d{2}-\d{2}","structure":"Workbench","direction":"Playful Pop"/);
  rmSync(dir, { recursive: true, force: true });
});

test('invoked through a symlink, the way every host installs the skill, it still runs', () => {
  // The first draft compared argv[1] with import.meta.url literally, so a
  // symlinked path exited 0 having printed nothing.
  const dir = workspace();
  symlinkSync(SKILL, join(dir, 'linked-skill'));
  const r = spawnSync(process.execPath, [join(dir, 'linked-skill/scripts/pick.mjs'), '--seed', '2110904443'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, GODDESIGN_USER_LEDGER: join(dir, 'user-ledger.json') },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^DIRECTION 10 Playful Pop/m);
  rmSync(dir, { recursive: true, force: true });
});

test('--log writes both ledgers and keeps 20 project and 40 user entries', () => {
  const dir = workspace();
  writeFileSync(join(dir, '.design-log.json'), JSON.stringify(Array.from({ length: 20 }, () => entry())));
  writeFileSync(join(dir, 'user-ledger.json'), JSON.stringify(Array.from({ length: 40 }, () => entry())));
  const last = entry({ direction: 'Luxury Serif', paper: 'dark', display: 'serif', accent_hue_deg: null });
  const r = run(['--log', JSON.stringify(last)], dir);
  assert.equal(r.code, 0, r.out + r.err);
  const project = JSON.parse(readFileSync(join(dir, '.design-log.json'), 'utf8'));
  const user = JSON.parse(readFileSync(join(dir, 'user-ledger.json'), 'utf8'));
  assert.equal(project.length, 20);
  assert.equal(user.length, 40);
  assert.deepEqual(project.at(-1), last);
  rmSync(dir, { recursive: true, force: true });
});

test('--log refuses a placeholder entry rather than poisoning the ledger', () => {
  const dir = workspace();
  const r = run(['--log', JSON.stringify(entry({ direction: '<name>', paper: '<dark|mid|light>' }))], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /refused: direction must be a name/);
  assert.equal(existsSync(join(dir, '.design-log.json')), false);
  rmSync(dir, { recursive: true, force: true });
});

test('under a map: no roll once the System lock has a seed, and one ledger entry only with --map-final', () => {
  const dir = workspace();
  writeFileSync(join(dir, '.design-map.md'), '# Design map: X\n\n## Destination\n\nx\n\n## System lock\n\n<pending>\n\n## Notes\n\nnone\n');
  assert.match(run(['--seed', '7'], dir).out, /^goddesign pick \| seed 7/, 'charting rolls once');
  writeFileSync(join(dir, '.design-map.md'), '# Design map: X\n\n## System lock\n\nSeed: 12345 | Direction: 1 Industrial\n\n## Notes\n\nnone\n');
  const inherited = run(['--seed', '7'], dir);
  assert.equal(inherited.code, 0);
  assert.match(inherited.out, /^MAP: .*seed 12345.*Do not roll/);
  const refused = run(['--log', JSON.stringify(entry())], dir);
  assert.equal(refused.code, 1);
  assert.match(refused.out, /--map-final/);
  assert.equal(run(['--log', JSON.stringify(entry()), '--map-final'], dir).code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test('a stale or partial install stops loud instead of letting the model improvise a row', () => {
  const root = workspace();
  const copy = join(root, 'goddesign');
  cpSync(SKILL, copy, { recursive: true });
  const script = join(copy, 'scripts/pick.mjs');
  const directions = join(copy, 'references/directions.md');
  const original = readFileSync(directions, 'utf8');

  // 1. A deck that lost its tail: 14 rows while the no-node fallback rolls % 17.
  const cut = original.split(/^## 14\. /m)[0];
  writeFileSync(directions, cut);
  let r = spawnSync(process.execPath, [script, '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /INCOMPLETE INSTALL: SKILL\.md no-node fallback rolls % \[17,12,10,12\] but the decks hold \[14,12,10,12\] rows/);

  // 2. A row missing a field is incomplete, not improvisable.
  writeFileSync(directions, original.replace(/^- Class: display=grotesque\n/m, ''));
  r = spawnSync(process.execPath, [script, '--seed', '1'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /INCOMPLETE INSTALL: references\/directions\.md row 0 Swiss International: no Class line/);

  // 3. A missing deck.
  rmSync(join(copy, 'references/layouts.md'));
  r = spawnSync(process.execPath, [script, '--seed', '1'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /INCOMPLETE INSTALL: references\/layouts\.md not found/);
  rmSync(root, { recursive: true, force: true });
});
