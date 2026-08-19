// Tests for the mechanical half of the QA gate: scripts/sweep.mjs and
// scripts/extract-tokens.mjs. Run: node --test scripts/sweep.test.mjs
//
// The corpus separation test is the load-bearing one. A source scanner that
// fires on clean work gets ignored, and then the gate is worse than it was
// before the script existed, so the calibration recorded in
// validation/research/design-skills-evaluation-2026-07.md is asserted here
// rather than left as a claim in prose.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Kept deliberately simple instead of fs.globSync, which needs Node 22; the
// skill's own scripts run on Node 18 and the tests should not raise that floor.
const pick = (dir, re) => readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => join(dir, f));

const SWEEP = 'skills/goddesign/scripts/sweep.mjs';
const EXTRACT = 'skills/goddesign/scripts/extract-tokens.mjs';

const run = (script, args) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
};
const sweepJson = (args) => {
  const r = run(SWEEP, [...args, '--json']);
  return { code: r.code, ...JSON.parse(r.out) };
};
const rulesOf = (j, sev) => [...new Set(j.findings.filter((f) => f.severity === sev).map((f) => f.rule))];

const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'goddesign-sweep-'));
  for (const [name, body] of Object.entries(files)) {
    const p = join(dir, name);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  return dir;
};

// A minimal build that passes every rule, so single-rule tests can add exactly
// one defect and attribute the finding to it.
const CLEAN_CSS = `/* goddesign | structure: Letter | direction: Industrial | accent: 24 */
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;800&display=swap');
:root { --bg: #12110E; --surface: #1A1A18; --text: #E6E6E2; --muted: #8A8A84; --accent: #FF4F00;
  --display: Archivo, sans-serif; --body: Archivo, sans-serif; }
body { background: var(--bg); color: var(--text); font-family: var(--body); }
a:focus-visible { outline: 2px solid var(--accent); }
a { transition: color 180ms ease-out; }
@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
`;
const CLEAN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="app.css"></head><body>
<section><h1>Fire the kiln</h1><p>Studio scheduling for ceramics.</p><a href="/book">Book a slot</a></section>
</body></html>`;

const clean = (extraCss = '', extraHtml = '') => fixture({
  'app.css': CLEAN_CSS + extraCss,
  'index.html': CLEAN_HTML.replace('</body>', `${extraHtml}</body>`),
});

// ---------------------------------------------------------------- basics

test('--rules prints the whole table and exits 0', () => {
  const r = run(SWEEP, ['--rules']);
  assert.equal(r.code, 0);
  const lines = r.out.trim().split('\n');
  assert.equal(lines.length, 32, 'the rule table is 32 rules');
  for (const id of ['banned-font', 'vague-attribution', 'filler-copy', 'formulaic-copy', 'reveal-cascade', 'token-drift', 'waiver-without-reason'])
    assert.ok(r.out.includes(id), `${id} is documented`);
});

test('no target is a usage error, not a silent pass', () => {
  assert.equal(run(SWEEP, []).code, 2);
});

test('nothing scannable exits 2 rather than reporting green', () => {
  const dir = fixture({ 'notes.txt': 'not a build' });
  const r = run(SWEEP, [dir]);
  assert.equal(r.code, 2);
  assert.match(r.err, /SWEEP UNAVAILABLE/);
  rmSync(dir, { recursive: true, force: true });
});

test('a clean build exits 0 with no failures', () => {
  const dir = clean();
  const j = sweepJson([dir]);
  assert.equal(j.failures, 0, JSON.stringify(j.findings, null, 1));
  assert.equal(j.code, 0);
  rmSync(dir, { recursive: true, force: true });
});

// ---------------------------------------------------------------- rules

test('a banned face is reported with the property that names it', () => {
  const dir = clean('\n.x { font-family: Inter, sans-serif; }');
  const j = sweepJson([dir]);
  assert.ok(rulesOf(j, 'fail').includes('banned-font'));
  rmSync(dir, { recursive: true, force: true });
});

test('a system display face is banned by name, and stays legal as a fallback', () => {
  // BANNED_FACE is anchored on the whole family string, so "Arial Black" never
  // matched "arial" and shipped as a display voice. Its one backstop, no-webfont,
  // is a whole-build boolean that any single import silences.
  const bad = clean('\n.hero-title { font-family: "Arial Black", sans-serif; }');
  assert.ok(rulesOf(sweepJson([bad]), 'fail').includes('banned-font'));
  rmSync(bad, { recursive: true, force: true });

  // firstFamily reads position 1 only, and all six corpus occurrences sit in
  // position 2. A fallback is not a chosen face.
  const ok = clean('\n:root { --display: "Anton", "Arial Black", sans-serif; }');
  assert.equal(rulesOf(sweepJson([ok]), 'fail').includes('banned-font'), false);
  rmSync(ok, { recursive: true, force: true });
});

test('a system stack is banned in position 1 and correct in a fallback tail', () => {
  // SKILL.md bans "a system stack as a chosen face", but GENERIC_FAMILY used to
  // skip these keywords before any ban was tested, so the clause had no enforcer.
  for (const stack of ['system-ui, sans-serif', '-apple-system, BlinkMacSystemFont, sans-serif', 'ui-serif, serif']) {
    const bad = clean(`\n.hero-title { font-family: ${stack}; }`);
    assert.ok(rulesOf(sweepJson([bad]), 'fail').includes('banned-font'), `${stack} must be reported`);
    rmSync(bad, { recursive: true, force: true });
  }

  // A fallback tail is what these keywords are for, and a flagged stack must not
  // also be reported as a face whose webfont import is missing.
  const ok = clean('\n:root { --display: "Anton", system-ui, sans-serif; --font-mono: "IBM Plex Mono", ui-monospace, monospace; }\n.x { font-family: inherit; }');
  const fails = rulesOf(sweepJson([ok]), 'fail');
  assert.equal(fails.includes('banned-font'), false);
  assert.equal(fails.includes('no-webfont'), false);
  rmSync(ok, { recursive: true, force: true });
});

test('an @import before the first rule does not swallow that rule', () => {
  // rulesOf() reads everything before the first '{' as the selector. A statement
  // at-rule ends in ';' and carries no block, so without dropping it the text
  // still starts with '@' and the NEXT rule is read as an at-rule container and
  // never scanned. The skill mandates an @import for webfonts and :root first for
  // tokens, so that is the exact shape it tells you to write.
  const withImport = fixture({
    'index.html': CLEAN_HTML.replace('<link rel="stylesheet" href="s.css">', '<link rel="stylesheet" href="s.css">'),
    's.css': `/* goddesign | structure: Letter | direction: Industrial | accent: 24 */
@import url('https://fonts.googleapis.com/css2?family=Jost&display=swap');
:root { --font-display: Inter, sans-serif; --bg: #12110E; --text: #E6E6E2; }
body { background: var(--bg); color: var(--text); font-family: var(--font-display); }`,
  });
  assert.ok(rulesOf(sweepJson([withImport]), 'fail').includes('banned-font'),
    'a banned face in the token block must be reported even behind an @import');
  rmSync(withImport, { recursive: true, force: true });

  // The at-rules that do carry blocks must still nest, not be flattened.
  const nested = fixture({
    'index.html': CLEAN_HTML,
    's.css': `/* goddesign | structure: Letter | direction: Industrial | accent: 24 */
@import url('https://fonts.googleapis.com/css2?family=Jost&display=swap');
:root { --bg: #12110E; --text: #E6E6E2; }
@media (min-width: 40em) { .card { color: #123456; } }`,
  });
  assert.ok(rulesOf(sweepJson([nested]), 'fail').includes('hex-outside-root'),
    'a rule inside @media must still be scanned as a component rule');
  rmSync(nested, { recursive: true, force: true });
});

test('@theme tokens are scanned exactly as :root tokens are', () => {
  // @theme holds bare declarations, not rules, so walking into it as a container
  // found no inner rule and every token in it went unscanned. Tailwind v4 writes
  // tokens there and extract-tokens.mjs reads them, so the gate has to see them.
  const rules = (block) => {
    const dir = clean(`\n${block} { --bg: #FFFFFF; --text: #808080; }`);
    const out = rulesOf(sweepJson([dir]), 'fail');
    rmSync(dir, { recursive: true, force: true });
    return out;
  };
  for (const block of ['@theme', '@theme inline']) {
    assert.deepEqual(
      rules(block).filter((r) => r === 'pure-base' || r === 'untinted-neutral').sort(),
      rules(':root').filter((r) => r === 'pure-base' || r === 'untinted-neutral').sort(),
      `${block} must be scanned like :root`,
    );
    assert.ok(rules(block).includes('untinted-neutral'), `${block} tokens reach the scanner`);
  }
});

test('mono is legal in a stated numerals slot and banned in the body slot', () => {
  const ok = clean('\n:root { --font-mono: "JetBrains Mono", monospace; }');
  assert.equal(rulesOf(sweepJson([ok]), 'fail').includes('mono-body'), false);
  rmSync(ok, { recursive: true, force: true });

  const bad = clean('\n:root { --body: "JetBrains Mono", monospace; }');
  assert.ok(rulesOf(sweepJson([bad]), 'fail').includes('mono-body'));
  rmSync(bad, { recursive: true, force: true });
});

test('a color literal in a component rule is reported, in :root it is not', () => {
  const dir = clean('\n.card { color: #FF4F00; }');
  assert.ok(rulesOf(sweepJson([dir]), 'fail').includes('hex-outside-root'));
  rmSync(dir, { recursive: true, force: true });
});

test('a side border is a stripe on a container and not on a bare rule line', () => {
  const rail = clean('\n.route-rail { border-right: 4px solid var(--accent); }');
  assert.equal(rulesOf(sweepJson([rail]), 'fail').includes('accent-stripe'), false);
  rmSync(rail, { recursive: true, force: true });

  const card = clean('\n.card { border-left: 4px solid var(--accent); padding: 24px; }');
  assert.ok(rulesOf(sweepJson([card]), 'fail').includes('accent-stripe'));
  rmSync(card, { recursive: true, force: true });
});

test('an achromatic neutral token is reported', () => {
  const dir = clean('\n:root { --surface-2: #101010; }');
  assert.ok(rulesOf(sweepJson([dir]), 'fail').includes('untinted-neutral'));
  rmSync(dir, { recursive: true, force: true });
});

test('the reveal cascade is reported only when unguarded and untimed', () => {
  const bad = clean('\n.reveal { opacity: 0; } .reveal.in { opacity: 1; } .r2 { opacity: 0; }',
    '<script>new IntersectionObserver(function(e){}).observe(document.body)</script>');
  assert.ok(rulesOf(sweepJson([bad]), 'fail').includes('reveal-cascade'));
  rmSync(bad, { recursive: true, force: true });

  const guarded = clean('\n.reveal { opacity: 0; } .r2 { opacity: 0; }',
    '<script>document.documentElement.classList.add("js");setTimeout(function(){},1500);new IntersectionObserver(function(e){}).observe(document.body)</script>');
  assert.equal(rulesOf(sweepJson([guarded]), 'fail').includes('reveal-cascade'), false);
  rmSync(guarded, { recursive: true, force: true });
});

test('an HTML numeric entity is not a hex literal', () => {
  const dir = clean('', '<p>Next &#8594; step</p>');
  const j = sweepJson([dir]);
  assert.equal(j.failures, 0, JSON.stringify(j.findings));
  rmSync(dir, { recursive: true, force: true });
});

test('copy advisories scan visible text with source lines and ignore hidden text', () => {
  const dir = fixture({
    'app.css': CLEAN_CSS,
    'index.html': `<!doctype html>
<html lang="en">
<body>
<p>Experts believe scheduling reduces missed firings.</p>
<p>In order to reserve a firing, choose an open slot.</p>
<p>This is not just a scheduler, but a complete studio companion.</p>
<script>const hidden = "in order to test";</script>
<!-- Reports suggest this hidden note should never count. -->
</body>
</html>`,
  });
  const j = sweepJson([dir]);
  assert.equal(j.code, 0, 'advisories never fail the gate');
  for (const [rule, line] of [['vague-attribution', 4], ['filler-copy', 5], ['formulaic-copy', 6]]) {
    const hits = j.findings.filter((f) => f.rule === rule);
    assert.equal(hits.length, 1, `${rule} should report only the visible phrase`);
    assert.equal(hits[0].line, line, `${rule} should preserve the source line`);
    assert.equal(hits[0].severity, 'advisory');
  }
  rmSync(dir, { recursive: true, force: true });
});

test('comments are described, not executed', () => {
  // Both of these name banned patterns inside comments and neither is a defect.
  const dir = clean('\n/* the one allowed !important kill switch lives above */\n/* lock: accent #6366F1 was rejected */',
    '<!-- do not ship font-family: Inter here -->');
  const j = sweepJson([dir]);
  assert.equal(j.failures, 0, JSON.stringify(j.findings));
  rmSync(dir, { recursive: true, force: true });
});

test('the band metronome needs a page, not a fragment', () => {
  const fragment = fixture({
    'app.css': CLEAN_CSS + '\n.a { padding: 32px; } .b { padding: 32px; } .c { padding: 32px; }',
    'index.html': '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><section><h1>One band</h1><a href="/x">Go</a></section></body></html>',
  });
  assert.equal(rulesOf(sweepJson([fragment]), 'fail').includes('metronome-padding'), false);
  rmSync(fragment, { recursive: true, force: true });

  const page = fixture({
    'app.css': CLEAN_CSS + '\n.a { padding: 32px; } .b { padding: 32px; } .c { padding: 32px; }',
    'index.html': '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><section>a</section><section>b</section><section>c</section><a href="/x">Go</a></body></html>',
  });
  assert.ok(rulesOf(sweepJson([page]), 'fail').includes('metronome-padding'));
  rmSync(page, { recursive: true, force: true });
});

// ---------------------------------------------------------------- waivers

test('a waiver with a reason suppresses its rule for that file only', () => {
  const dir = fixture({
    'app.css': `/* goddesign-allow: metallic-premium the Art Deco row is the one row that states metallics */\n${CLEAN_CSS}\n:root { --metal: #D4AF37; }`,
    'other.css': `/* goddesign | structure: Letter | direction: Art Deco | accent: 42 */\n:root { --metal: #D4AF37; }`,
    'index.html': CLEAN_HTML,
  });
  const j = sweepJson([dir]);
  const metallic = j.findings.filter((f) => f.rule === 'metallic-premium');
  assert.ok(metallic.length > 0, 'the unwaived file still reports');
  assert.ok(metallic.every((f) => f.file.endsWith('other.css')), 'the waived file does not');
  rmSync(dir, { recursive: true, force: true });
});

test('a waiver without a reason is itself a failure', () => {
  const dir = clean('\n/* goddesign-allow: metallic-premium */\n:root { --metal: #D4AF37; }');
  const fails = rulesOf(sweepJson([dir]), 'fail');
  assert.ok(fails.includes('waiver-without-reason'));
  assert.ok(fails.includes('metallic-premium'), 'the reasonless waiver does not suppress');
  rmSync(dir, { recursive: true, force: true });
});

// ---------------------------------------------------------------- extraction

test('extract-tokens reports nothing extractable as the greenfield answer', () => {
  const dir = fixture({ 'readme.txt': 'no design system here' });
  const r = run(EXTRACT, [dir]);
  assert.equal(r.code, 2);
  assert.match(r.err, /NO DESIGN SYSTEM FOUND/);
  rmSync(dir, { recursive: true, force: true });
});

test('extract-tokens resolves lock role slots and its baseline round-trips clean', () => {
  const dir = clean();
  const baseline = join(dir, 'baseline.json');
  const e = run(EXTRACT, [dir, '--out', baseline]);
  assert.equal(e.code, 0);
  assert.match(e.out, /--bg #12110e/);
  assert.match(e.out, /--accent #ff4f00/);
  assert.match(e.out, /Archivo/);
  const j = sweepJson([join(dir, 'app.css'), join(dir, 'index.html'), '--tokens', baseline]);
  assert.equal(rulesOf(j, 'fail').includes('token-drift'), false, JSON.stringify(j.findings));
  rmSync(dir, { recursive: true, force: true });
});

test('extract-tokens reads a W3C design-token file', () => {
  const dir = fixture({
    'design-tokens.json': JSON.stringify({
      color: {
        background: { $value: '#12110E' },
        accent: { $value: '#FF4F00' },
      },
      fontFamily: { display: { $value: 'Archivo, sans-serif' } },
    }),
  });
  const r = run(EXTRACT, [dir, '--json']);
  assert.equal(r.code, 0);
  const b = JSON.parse(r.out);
  assert.ok(b.hexes.includes('#12110e'));
  assert.ok(b.fonts.includes('Archivo'));
  rmSync(dir, { recursive: true, force: true });
});

// ---------------------------------------------------------------- calibration

test('the sweep separates goddesign artifacts from unskilled ones', () => {
  const gd = [
    ...pick('validation/runs/kilnhouse-2026-07', /skill.*\.html$/),
    ...pick('validation/runs/wayfare-2026-07', /^wayfare-gd-.*\.html$/),
    ...pick('validation/runs/ledgerbird-2026-07', /^ledgerbird-gd-.*\.html$/),
  ];
  const other = [
    ...pick('validation/runs/wayfare-2026-07', /^wayfare-(fd-|base)/),
    ...pick('validation/runs/ledgerbird-2026-07', /^ledgerbird-(fd-|base)/),
  ].filter((f) => f.endsWith('.html'));
  assert.ok(gd.length >= 10, `expected the skill-run corpus, found ${gd.length}`);
  assert.ok(other.length >= 6, `expected the comparison corpus, found ${other.length}`);

  const gdFails = gd.map((f) => sweepJson([f]).failures);
  const otherFails = other.map((f) => sweepJson([f]).failures);

  // Every recorded finding on a skill run was inspected and is a true positive
  // against a rule that run pre-dates; the bar is that none is noisy.
  for (const [i, n] of gdFails.entries())
    assert.ok(n <= 2, `${gd[i]} reported ${n} failures; a skill run over 2 means a new false positive`);
  assert.ok(gdFails.filter((n) => n === 0).length >= gd.length * 0.6,
    `only ${gdFails.filter((n) => n === 0).length}/${gd.length} skill runs are clean`);

  for (const [i, n] of otherFails.entries())
    assert.ok(n >= 1, `${other[i]} reported no failures; the sweep stopped separating`);
});
