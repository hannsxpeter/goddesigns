# Changelog

## v2.0.0 (2026-09-26)

The lean-core release. The owner asked whether goddesign still earns its cost now that frontier models are better and more expensive, given that much of it re-taught things those models do unprompted while it still helped weaker ones. The answer measured in this session: the parts no model can do for itself are small (pick at random, remember past runs, measure the render, hold this owner's taste), and most of what every run read was neither. v2.0.0 keeps the first set, moves the rest to where it is needed, and pre-registers the test that decides whether the cut cost quality.

### What a run reads, measured in bytes

| Path | v1.8.0 | v2.0.0 | Change |
|---|---|---|---|
| New page, frontier model | 95,159 (SKILL.md, checklist, both decks, motion, copy) | 16,420 (SKILL.md and the picker's printout) | 5.8x less |
| Edit to an existing page | 66,770 (SKILL.md and the checklist, then the full gate) | 12,699 (SKILL.md, then the sweep on changed files) | 5.3x less |
| New page, full lane | 95,159 | 54,842 (adds full-lane.md, the checklist, and copy) | 1.7x less |

`references/motion.md` (4,384 bytes) is read only before an entrance or scroll animation, and `references/copy.md` (3,052) on the frontier lane only for copy-heavy marketing pages. The measurement behind the decision: across the owner's six real sessions that used the skill outside this repository, its own reads and scripts were 134 of 4,643 tool calls; the cost that mattered was the fixed reading on every invocation, the self-graded critique, and the full ceremony on small jobs (two README SVGs went through a seed roll, and a truncated-headline fix loaded the whole skill).

### `pick.mjs`: the variance engine is code now

- `skills/goddesign/scripts/pick.mjs` rolls the seed, reads both run ledgers, applies the four rotation rules (no structure from the last 3 runs; the direction differs from the previous run on paper band, display class, or accent band; no third consecutive paper or accent band in the user ledger; a popularity cap resting any direction seen 3 times or structure 4 times in the last 8 runs), jitters the tokens, and prints one direction row, one macrostructure, paste-ready `:root` tokens, the stylesheet stamp, a pre-filled DIRECTION LOCK, and the exact `--log` command to persist the run. The model fills in three lines (Layout, Signature, Grammar).
- The derivation is the shell seed's, with deck sizes read from the decks, so a modulus can no longer drift out of sync with a deck. The regression suite pins a real receipt: seed 2110904443, which the Bellweather run rolled and rotated by hand, lands on row 10, skips it because the user ledger's last two runs were light paper, and settles on row 11 Luxury Serif, structure 4 Workbench, jitter h+9, exactly as that run's lock recorded.
- Paper band and accent hue band are computed from the hexes in OKLCH; every direction row gained a `- Class: display=...` line for the display class. `--reroll` is the steering override (display class and accent band both change), `--keep-direction` serves a brief that names its own aesthetic, `--show` prints one remix row, `--check` verifies the install, and `--log` writes both ledgers and refuses a malformed or placeholder entry.
- Under a design map the picker refuses to roll once the System lock carries a seed, and `--log` refuses a per-surface entry until `--map-final`, so the map's two inversions are enforced rather than only stated.
- The tests caught a bug worth recording: the first draft's "run only when invoked directly" guard compared `argv[1]` with the module path literally, so a run through a symlink (the way every host installs the skill) exited 0 having printed nothing. It now compares real paths, and a test invokes it through a symlink.

### Lanes by capability, routing by task

- `SKILL.md` is rewritten as the lean core: 12,699 bytes against 35,760, under a 13,000-byte ceiling that `lint-decks.mjs` enforces. It routes the task (edit, existing design system, multi-session map, new page), states the lanes, runs the full path in five short steps (context, pick, lock, subject test, build), and keeps the owner-taught rules as one-liners: the subject test, the substance gate, the mandatory atmosphere layer, the four grammar breaks, and the Banned list with every INSTEAD.
- The frontier lane (Claude Opus and Fable class) works from the core and the picker's printout. The full lane (Codex and GPT models, Sonnet, Haiku, mini, flash, lite, and any model unsure which it is) also reads the new `references/full-lane.md`: the old EXPAND lane, the enumerated craft floor, the CSS hygiene and modern-CSS lists, and routing through the long-form checklist and the copy review.
- An edit to an existing page no longer runs the pick, the lock, or the full gate: the Banned list and build rules apply to what it touches, and the sweep runs on the changed files. The standing-rule snippet in `docs/INSTALL.md` now says so, instead of "invoke it and follow it fully" for every frontend task.

### Retired from the per-run path

- **The seven-axis self-critique (checklist Phase 1).** Scored by the context that made every choice, advisory, and the gate's most output-heavy step. Its useful parts live where they can be checked: the subject test and substance gate, the trust-surface gate, and the picker's ledger rules.
- **The blind read as a default.** It now runs on request, because it spends a second model call on every run.
- **`verify-install.sh` and `detect-clis.sh` on every run.** The install check moves to install time (`scripts/install.sh`) and into the picker, which stops with `INCOMPLETE INSTALL` on a missing or partial deck. `detect-clis.sh` had no consumer left and is removed; `blind-read.sh` and `genimage.sh` detect their own CLIs.
- **Governance prose in the core.** Cross-host scope is one sentence; provenance hygiene is one pointer, with its guard rails in `references/provenance-hygiene.md`, where `lint-decks.mjs` now checks them.

### Study A closed, the four-arm comparison pre-registered

- Study A closed with zero rater responses, nine weeks after its generation finished. The core external claim stays **unvalidated**, and the README, validation index, and contributing guide now say so plainly. The closure is recorded in `validation/studies/study-a-2026-07/` (the frozen receipts are unchanged), and `validation/protocols/external-validation-protocol.md` is marked retired.
- Removed, all recoverable with `git checkout v1.8.0 -- <path>`: the `study-a-rater/` Next.js and D1 application (58 files, and the dependency upkeep v1.7.0 spent a release on), the nine `scripts/study-a-*.mjs` tools and their test file, `validation/tools/blind-eval-pack.sh`, and the six CI steps that tested the study tooling and built, tested, and audited the rater app. The deployed rater and its D1 database live outside the repository and are the owner's to delete.
- `validation/studies/lean-core-2026-09/` pre-registers what decides v2.0.0's bet: five of Study A's frozen briefs, four arms (a frontier model with no skill, the lean core, v1.8.0, and a cheaper model on the lean core's full lane), one owner-ranked blind pack, and three decision rules fixed in advance. `scripts/arm-test.mjs` runs it: each cell in an isolated workspace under `claude -p --safe-mode` (no CLAUDE.md, installed skill, plugin, hook, or MCP server), the skill appended the way a host loads one, both ledgers empty, then the harness's own sweep and audit, a blind pack with a sealed key, and a mechanical reveal. It needs the `claude` CLI logged in: the desktop app's login does not carry over to `claude -p`, and on the maintainer's machine it was logged out until the owner ran `claude auth login` on 2026-09-26. Launched from inside a Claude Code session, the harness strips that session's environment (its messaging socket, session id, API base URL, and `CLAUDE_EFFORT`, which would override the protocol's effort). `--jobs` runs cells concurrently while the cells that park the home ledger (v1.8.0 reads `~/.design-log.json` itself) take turns, and `--retry-failed` re-runs only a cell that never reached the model.
- One amendment before any run: the per-run caps rose from $20 and 45 minutes to $40 and 90 minutes, after the smoke runs below took about 25 minutes to reach a first page, so the caps could not cut off the heavier arm mid-fix-loop and bias the lean-versus-full criterion. No arm, brief, criterion, or threshold changed.

### Smoke validation: one brief, both versions

`validation/runs/lean-core-smoke-2026-09/` designed Study A's B01 once under the v2.0.0 working tree and once under v1.8.0, each by a fresh-context subagent on the same model, and re-measured both pages with the repository's own scripts. It is one pair, not the comparison.

- Both gates are green on re-measurement: sweep exit 0 and audit exit 0 with no finding at 375, 768, or 1280.
- v2 read 16 KB of instructions to v1.8.0's 95 KB, but its total subagent tokens were only 18% lower (319,474 against 388,883) and it finished 4.2 minutes sooner (32.8 against 37.0). Building and verifying the page dominates a full run's cost, so the reading cut moves the total far less than it moves the reading. The four-arm study measures this properly.
- **A regression, found and fixed before the tag.** The v2 page stated prices and terms the brief never gave without marking them as placeholders; v1.8.0's checklist had required that for demo builds, and the rule was compressed out of the core. `SKILL.md` restores it in the build rules and the lock check (12,699 bytes, still under the ceiling), and `lint-decks.mjs` pins the sentence.
- **Both versions converged on the same content**: a stored pageview record as the signature, a midnight-salted visitor hash, pricing from $9, a Monday report. The seed varied the form (Organic Modern with Specimen, against Editorial Magazine with Letter); nothing varied what the model believes the subject is. Recorded as the open frontier, not as a v2 regression.

### Install integrity

- **The skill was not loading in Claude Code on the maintainer's machine.** `~/.claude/skills/goddesign` pointed at `/Users/hprincivil/Projects/goddesigns/...`, a path that stopped existing when the account was renamed, while the global rule kept telling every session to use the skill. The Codex links had been re-pointed on 2026-09-05; the Claude link was missed. Nothing reported it: `verify-install.sh` run from the clone checks the clone, and Claude Code simply stops listing a skill it cannot resolve.
- `scripts/install.sh` links the skill into Claude Code and Codex with `ln -sfn`, repairs stale links, refuses to overwrite a real directory, and runs the install check through every link. `--check` verifies without changing anything, and names a dangling link with its dead target.
- `verify-install.sh` now requires `references/full-lane.md` and `scripts/pick.mjs`, reads its moduli from the no-node fallback line, and says in its header to run it through the installed path.
- The installer repaired the maintainer's Claude Code link on 2026-09-26. The same account rename had also broken the `godaudits` and `godplans` skill links in all three host directories; those belong to other projects and were re-pointed by hand at the owner's request.

### Drift found and corrected

A read-only audit of the documentation against the code at v1.8.0 found these; each is fixed in this release unless it says otherwise.

1. The Claude Code install link dangled (above), and `docs/INSTALL.md` Step 3 could not have caught it: run from the parent directory its command exits 127, and run inside the clone it checks the clone.
2. The documented repair, "redo Step 2", failed on an existing link, because plain `ln -s` stops with "File exists". The docs now use the installer or `ln -sfn`, and warn that moving the folder or renaming the account breaks absolute links.
3. The README's install block omitted the `mkdir -p` that `docs/INSTALL.md` included; the installer replaces both.
4. `references/directions.md` said row 16 was the only row needing a waiver, but row 13's `#D4AF37` is on the sweep's metallic list at `fail`: the repository's own Art Deco build fails `metallic-premium`. Row 13 now carries its exact waiver line, and the sentence names both rows.
5. The deck's spacing scale stopped at 128 with "airy" adding 160, while `SKILL.md` and `sweep.mjs` put 160 in the base scale. The deck now states the scale the sweep enforces.
6. The checklist told the blind read to use `shot-1280.png shot-375.png`, but the audit writes `audit-1280.png` and `audit-375.png`, so followed literally `blind-read.sh` exited 1. Corrected everywhere.
7. The checklist listed seven file types for the sweep; it reads fifteen and skips build directories. The list is complete now.
8. The example lock in `SKILL.md` was not reproducible from its own formula (seed 2214070812 gives direction 9, not 12; it predated the 17-row deck). The example is gone: the picker prints real locks.
9. The edit route and `references/map.md` sent work through "Steps 4c-4d", skipping the copy step v1.8.0 added. Both are rewritten around the new routes.
10. `SKILL.md` and `references/imagery.md` said image generation used "an installed image-capable CLI"; `genimage.sh` implements Codex only. Both now name it.
11. `CONTRIBUTING.md` capped each 30-degree accent band at 2 rows and `docs/ARCHITECTURE.md` said `lint-decks.mjs` enforced the deck caps; nothing measured them. Measured now: band 0-30 holds rows 7, 10, and 16, five red-orange rows (10, 7, 16, 0, 1) sit within 23 degrees, and rows 0 and 16 fail the confusable-pair test. `lint-decks.mjs` now measures the cap, records the existing breach as dated known debt, and fails on any new one. **Not fixed**: rebalancing the deck changes designs, so it waits for the owner.
12. `CONTRIBUTING.md` made tilt exclusive to row 6 (the 2026-07-18 rule), but rows 10 and 15 still tilt. Recorded as deck debt; **not fixed**, for the same reason.
13. `CONTRIBUTING.md` named only `SKILL.md`'s moduli to update when a deck grows, while `lint-decks.mjs` also hard-codes the sizes. It now lists all three places.
14. The README's "clears 14 of 19 goddesign pages" was the v1.6.0 subset. Re-measured over all 49 artifacts: 21 of 31 goddesign pages clean (the other 10 have one or two failures), all 18 other pages failing at 6 to 70. The README now also says the split measures compliance with goddesign's own rules, not quality.
15. The README called Study A "underway" with "20+ outside raters" when no participant URL had been issued and no rater had responded. It is now described as closed.
16. `docs/ARCHITECTURE.md` said the scripts "now carry 21 sweep tests and 316 lint checks"; v1.8.0 had 24 and 348, and v1.6.2 shipped 22 and 316. The sentence is dated to v1.6.2.
17. The external validation protocol said every published run was Claude-lane, contradicted by the Kilnhouse Codex runs and Study A's Codex replication receipt. Corrected in the retired protocol's record.
18. The CI comment said the sweep test checked "the corpus separation the evaluation record claims"; it checks a named subset. The comment says so now, and CI runs on Node 18 as well as 22, since the docs promise Node 18 or newer.
19. `study-a-rater/DESIGN-QA.md` cited screenshots in the ignored `output/` directory. Moot: the app is removed.
20. Orphans: `scripts/study-a-secrets.mjs` and `scripts/study-a-replication-receipt.mjs` had no caller, doc, or test. Removed with the rest of the Study A tooling.

### Tests

- `scripts/pick.test.mjs`: 18 tests, including the Bellweather receipt, every ledger rule, the map guards, a symlinked invocation, and three partial-install shapes.
- `scripts/arm-test.test.mjs`: 11 tests. No model is called: they pin `--safe-mode` on every arm, the skill on skill arms only, the variadic `--add-dir` ordering, Study A's brief text verbatim, the launching session's environment stripped, only API-level failures counted as retryable, a blind pack that names no arm, model, or skill, and the frozen 4-of-5 decision rule.
- `scripts/lint-decks.mjs`: 381 checks, with new ones for the `SKILL.md` byte budget, pick and lane routing, the retired per-run rituals staying retired, the placeholder rule the smoke run restored, the provenance guard rails in their new home, the measured accent cap, and `pick.mjs --check`. Each new check was negative-tested against the v1.8.0 files.
- `scripts/sweep.test.mjs` (24) and `scripts/provenance-hygiene.test.mjs` (5) are unchanged and green.

## v1.8.0 (2026-08-19)

### Mode-aware copy review

- Evaluated [`cursor/plugins` pstack `unslop`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/unslop/SKILL.md) at commit `60c641e4fad674784b30abcf9f8915dea39df38d`. Its post-draft loop, specificity test, and source-or-delete discipline ship; universal word and grammar bans, intentional messiness, automatic rewriting, and authorship implications are declined.
- `skills/goddesign/references/copy.md` adds a four-pass review after visible copy exists and before the QA gate. It assigns mode by block: transactional copy stays predictable, while marketing copy names a mechanism, observable result, real example, or source and may carry a point of view.
- The Phase 2b Copy group adds seven contextual assertions for action labels, useful errors and empty states, concrete claims, named attribution, the cross-product substitution test, forced structures, sentence density, and mode-appropriate rhythm.
- Substantial copy changes after screenshots now explicitly invalidate the old visual evidence and repeat the full gate.

### Three calibrated copy advisories

- `vague-attribution`, `filler-copy`, and `formulaic-copy` expand the deterministic source scan from 29 to 32 rules. They are advisory because a scanner cannot see every nearby citation, deliberate quotation, or domain context.
- Visible-text extraction now blanks tags, scripts, styles, comments, and entities in place. Copy findings therefore report the real source line while hidden phrases remain invisible to the rules.
- The 49 non-withdrawn HTML artifacts under `validation/runs/` and `validation/experiments/` produce zero findings from the three new rules. A regression fixture supplies one visible positive per rule, verifies source lines and advisory severity, and proves that duplicate phrases in script and comment blocks do not report.
- The existing population-separation regression remains green. The new rules make the narrower claim of copy-quality prompting, not authorship or human-versus-model classification.

### Documentation and install integrity

- `SKILL.md`, the README, setup guide, architecture, validation index, checklist, and release notes now document the copy lane and its boundaries.
- `verify-install.sh` treats `references/copy.md` as the ninth required reference file, so a partial installation cannot silently skip the pass.
- `validation/research/unslop-evaluation-2026-08.md` freezes the evaluated source, license, adoption and refusal record, calibration result, and kill conditions.

## v1.7.0 (2026-08-14)

### Prompt-specified provenance hygiene

- Evaluated [`guillaumemeyer/watermarks-remover`](https://github.com/guillaumemeyer/watermarks-remover) v0.4.0 at commit `28eca2d91fd485213045b86896db671937432a48`. The adopted mechanism is inspect, classify confidence, clean only the requested channel, verify, and report residual risk. The anti-detection product posture, default statistical rewriting, default pixel regeneration, evidence mutation, and human-authorship implications were declined.
- `skills/goddesign/scripts/provenance-hygiene.sh` discovers an existing `remove-ai-marks` companion through an explicit environment override, project-local skill directories, or common Codex and Claude skill directories. It delegates file, image, rewrite, directory, and website operations without installing or updating anything.
- `skills/goddesign/references/provenance-hygiene.md` makes the feature prompt-specified and post-gate. Ordinary design remains the complete default; a missing companion never changes the design QA score. Cleaning defaults to a new output, frozen validation evidence is excluded, and lossy text or pixel work forces the full design gate to run again.
- The direct calibration audit classified 258 repository files and produced 3 confirmed, 15 probable, 2 informational, and 1 likely-false-positive findings. It found real C2PA containers in three PNGs, but also exposed why auto-clean is unsafe: the skill description itself looked like probable AI metadata, unsupported WebP files were read as text, and a frozen corpus control character was legitimate evidence.
- Five deterministic adapter tests cover explicit and project-local discovery, argument-safe dispatch, honest absence, and unknown operations. CI now runs them as a separate gate.

### Dependency security

- The current registry audit newly classified the rater app's transitive `nanoid@3.3.16` as high severity and the pinned `postcss@8.5.22` as moderate. `next` moves from 16.2.11 to 16.3.1, the PostCSS override moves to 8.5.26, and the resolved Nano ID moves to 3.3.18. The blocking production-surface audit returns to zero vulnerabilities, and the production build plus rendered-HTML tests remain green.
- The full development-tree audit remains informational and visible in CI. Its remaining advisories sit in build or local-development tooling, including an `image-size` advisory for which the registry proposes downgrading `vinext` from 0.0.50 to 0.0.45 as a breaking change rather than offering a patched current release.

## v1.6.4 (2026-08-04)

The documentation release. No change to the skill, the decks, or the gate scripts: every mechanism, rule id, exit code, and threshold is identical to v1.6.3. What changed is who the documentation is written for. The README had become an architecture summary competing with `docs/ARCHITECTURE.md`, which meant a reader deciding whether to install had to parse "seeded macrostructures" and "29 deterministic sweep rules over the source" before learning what the thing does.

### The README is now the front door, not the second architecture doc

- Opens on the problem in the reader's terms (the purple gradient hero, the cream-serif-terracotta page, "people identify these sites on sight") before naming a single mechanism.
- The two failure modes are a two-row table instead of a paragraph of theory.
- Mechanisms are described by what they do for the reader: it rolls the dice and holds itself to the result, it writes the design down before it builds, it checks its own work, it keeps a multi-screen product looking like one product.
- New sections: who it is for, a plain-English FAQ, and a glossary decoding the seven terms the skill's own output uses (direction lock, deck, seed, sweep, audit, gate, design map).
- The evidence section keeps every caveat verbatim. External validation is still explicitly not claimed, the unfinished rater study is still named as unfinished, and the withdrawn capture is still linked. Those are the strongest thing the project has to say and they are stated more plainly, not softened.

### Two figures, composited from real captures

- `docs/assets/seven-directions.png`: the seven Kilnhouse skill runs side by side, the claim the README makes in its first sentence, shown rather than asserted.
- `docs/assets/audit-catches.png`: full-page captures of both unskilled baselines beside a skill run, where the reveal bug is visible as two pages that are simply empty below the hero.
- Both are real screenshots from `validation/runs/kilnhouse-2026-07/`, scaled and labelled. No generated imagery: a project whose thesis is that AI-made design is recognizable does not illustrate itself with AI-made design, and the actual captures are better proof anyway.

### The other three documents

- `docs/INSTALL.md` is now a numbered setup guide (what you need, download, link, verify, optional automation) with the optional dependencies as an if-you-install / you-get / if-you-skip-it table, and a troubleshooting section covering the four failures people actually hit. The verify step now states why it matters, since a stale copy is the most common cause of a generic-looking result.
- `CONTRIBUTING.md` leads with why the evidence bar exists rather than asserting it, routes newcomers with a table, and states the human-genome lane as open to non-designers, which it always was. The distribution caps carry their reasoning inline. Every mechanical requirement is unchanged.
- `validation/README.md` gains a five-item reading order for anyone auditing the claims, a "what is proven and what is not" split, the two evaluation records missing from its index (the impeccable second pass, the banned-list refusal), and the `WITHDRAWN-` retention convention.
- `docs/ARCHITECTURE.md` keeps its depth and gains a six-point summary plus a pointer sending casual readers elsewhere.

### Image generation is documented as Codex and ChatGPT

`scripts/genimage.sh` has always delegated to the `codex` CLI's built-in image tool, and the docs described it as "an installed image-capable CLI", which told a reader nothing about what to install. README, INSTALL, and ARCHITECTURE now name the path, and INSTALL carries a "Generating images" section with the usage, the exit-2 fallback to the row's CSS/SVG art, and the one requirement.

### Repo hygiene

`audit.mjs` writes `audit-<viewport>.png` and a sandboxed run writes `audit-handoff.sh` into the working directory, so running the gate at the repository root left untracked artifacts behind every time. Both are now ignored at root only, which leaves the named captures under `validation/` tracked as before.

## v1.6.3 (2026-08-04)

The refusal release. An attempt to mechanize the five Banned-list clauses v1.6.2 left open produced **zero new sweep rules** and two real bug fixes. Every candidate that reached a clean corpus split was then broken on legal, deck-faithful code, and four of the five died the same way: the deck states the pattern, and a source scanner cannot read the DIRECTION LOCK that makes it legal. Record: `validation/research/banned-list-mechanization-2026-08.md`.

### An `@import` before the first rule silently swallowed that rule
- `rulesOf()` read everything before the first `{` as the selector. A statement at-rule (`@import`, `@charset`, `@namespace`) ends in a semicolon and carries no block, so the text still began with `@`, the parser read the **next** rule as an at-rule container, and its declarations were never scanned.
- The skill mandates an `@import` for webfonts and `:root` first for tokens, so **the stylesheet shape the skill prescribes was the shape that evaded it**. Measured: `:root { --font-display: Inter, sans-serif }` behind an `@import` swept green; the identical file without the `@import` reports `banned-font`.
- This is the same class as the `@theme` bug v1.6.2 fixed and the more serious of the two, because `@theme` affects Tailwind v4 projects while this affected any stylesheet written the way the skill says to write one. Three files in the repo had a swallowed first rule, including both stylesheets of `validation/runs/bellweather-2026-08/`, whose token block was therefore unchecked when that run was gated. That run was re-gated and still exits 0.
- Fixed by dropping everything up to the last `;` when computing a rule's selector, with line numbers preserved. Corpus split: **zero change across all 49 pre-existing artifacts.** `@media`, `@supports`, `@layer` blocks and `@font-face` still nest correctly, all covered by a regression test.

### Deck row 16 contradicted its own gate
- Row 16 Trade Counter states `ONE family only: Poppins`, and Poppins is on the Banned list at `fail`. The contradiction was invisible before the parser fix, because a row-16 build declares its face in a custom property behind an `@import`. With the parser fixed, a faithful row-16 build fails its own deck row.
- The row is a genome extracted from a real human-built site, so changing the face would falsify the evidence. The row now carries the exact `goddesign-allow` comment to ship, and it is the only deck row that requires a waiver to pass its own gate.
- Related drift, also fixed: `BANNED_FACE` bans Helvetica, Segoe UI, and Noto Sans, which `SKILL.md`'s Banned bullet 1 did not name, so the Banned list was narrower than the rule enforcing it. The bullet now names them.

### Thirteen clauses move to the tier that can decide them
- 13 new Phase 2b assertions across Color, Layout, Motion, and Honesty, covering cyan-magenta washes, purple-tinted shadows, the cream and acid-green reflexes, glassmorphism, fake chrome, sparklines, marker underlines, decorative icons, emoji and mixed icon sets, bounce easing, confetti, animated focus rings, and weightless headings. Phase 2b is read with the lock in hand, which is the context a source scanner lacks and exactly what these clauses need.
- One over-claim corrected: a Layout line marked three clauses `[sweep]` when the sweep covers two. Contents rails and chapter headers have no rule and never did; the line is now two lines and the uncovered half says so.
- Two boundaries recorded as render-tier on purpose: "cards inside the hero" resolves against the first viewport, which only `audit.mjs` can compute, and "icons on non-interactive elements" resolves against what a mark reads as, which fired 3/25 on clean work when attempted as a source rule.

### Why nothing shipped as a rule
- Four candidates collide with the deck. Row 3 Terminal Core's stated Signature *is* an accent-colored span inside a heading; row 15 states the torn-paper divider `marker-underline` flagged; all four cream-ground serif rows fire once the build carries the destructive colour the checklist mandates.
- The fifth collides with the skill itself. A purple-shadow ban at OKLCH hue 272-330 fires on row 12, whose accent `#2B4BFF` sits at hue 267.1, because Step 3d **mandates** a jitter of -12 to +12 and eight of the twenty-five equally likely rolls land it inside the banned band.
- Two more were declined on measurement: emoji-as-icons has zero emoji-presentation code points anywhere in 25 goddesign, 18 comparison, and 10 study-a artifacts, and cyan-magenta washes fire on nothing at all. No defect to reproduce means the evidence bar is unmet, not that the pattern is fine.
- The most counter-intuitive measurement: of 22 `backdrop-filter` rules across both populations, **19 are a frosted nav or header bar**. A naive glassmorphism rule scores 2/25 against 17/18 and looks like a superb separator while actually detecting sticky headers.

### Tests
- `scripts/sweep.test.mjs` 22 to 23, adding the `@import` swallow regression and its at-rule nesting counterpart. `scripts/lint-decks.mjs` stays green at 316. Rule count stays 29.

## v1.6.2 (2026-08-04)

The parity release. impeccable was re-read at v3.5.0 and, for the second time, the yield was not a mechanism to port but a set of places where goddesign stated a rule and did not enforce it. Four gaps closed: two escapes in the mechanical sweep, one gate state that had no name, and one install check that tested presence where it needed integrity. No sweep rule was added, no rule id or severity changed, and the rule count stays 29. Twenty-two of twenty-four candidate borrows were refuted, and the declines are recorded in as much detail as the adoptions. Full borrow-and-decline record: `validation/research/impeccable-evaluation-2026-08.md`.

### `banned-font` did not enforce its own prose
- `BANNED_FACE` is anchored on the whole family string, so `"Arial Black"` could never match `^arial$` and shipped as a display voice while `SKILL.md` banned it in prose as a system stack. The one backstop failed too: `no-webfont` is a whole-build boolean that fires only when **no** font import exists anywhere, so a single legitimate `@import` for the body face silenced it for every other named face. Measured before the fix: a page importing a webfont for body, declaring `font-family: "Arial Black", Impact` for display, exits 0 green.
- `arial black` is now named in the regex. This is enforcement parity for a family already banned in prose, not a new tell, so the `CONTRIBUTING.md` evidence bar for tells does not apply. **Impact is deliberately not added**: it is a new family with no corpus occurrence and no sourced complaint, and it stays out until it has either.
- The rule's own description string was already narrower than its implementation, naming six families where the regex held ten. It now names all ten, in `sweep.mjs`'s `RULES` table (which `--rules` prints) and in the Phase 2a table in `references/checklist.md` that mirrors it. `SKILL.md`'s Banned list names Arial Black and states that a system face is banned as the display voice, not only as body.
- Fallback position stays legal: `firstFamily()` reads position 1 only, and all six corpus font declarations naming one of these families put it in position 2, behind Bricolage Grotesque, Archivo Black, or Anton. A seventh grep hit is the English word inside a heading, which the rule correctly ignores because it reads declarations and not page text.

### The system stack had no enforcer either
- The same Banned bullet ends "or a system stack as a chosen face", and that clause had never been mechanical. `GENERIC_FAMILY` lumped the system-stack keywords (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `ui-sans-serif`, `ui-serif`, `ui-monospace`, `ui-rounded`) together with the true generic families and CSS keywords, and skipped the lot before any ban was tested. `font-family: system-ui, sans-serif` as a display voice passed the sweep.
- The two groups are now separate. `GENERIC_FAMILY` keeps only what is never a chosen face and never needs an import (`sans-serif`, `serif`, `monospace`, `cursive`, `fantasy`, `inherit`, `initial`, `unset`, `revert`, `var(`, `emoji`, `math`, `fangsong`). `SYSTEM_STACK` holds the keywords, and in the chosen-face position they report `banned-font`.
- Position is the whole rule, and it is what keeps this safe. These keywords are correct in a fallback tail behind a real face, `firstFamily()` reads position 1 only, and a flagged stack is dropped before `namedFaces` so it is never also reported as a face missing its import. `inherit` and `var(--x)` are untouched.
- No direction row can state a system stack, because `CONTRIBUTING.md` requires every row carry a real family and a working import line and none of these have one. That is why this is `fail` rather than `advisory`: no lock line can make it legal. The inline waiver remains the route for a genuine exception.
- Folded into `banned-font` rather than added as a new rule id, because `SKILL.md` states it as one ban in one bullet. The rule count stays 29, so the two-file rule table, `sweep.test.mjs`'s table assertion, and the README's counts are all untouched.
- Corpus measured before writing the rule: 25 system-stack keyword usages across the corpus and **every one sits in position 2 or later** (`"Anton", system-ui, sans-serif`, `"IBM Plex Mono", ui-monospace, monospace`, and so on). The rule is therefore corpus-neutral by construction, exactly like the two fixes above.

### `@theme` token blocks were invisible to the sweep
- `rulesOf()` treated every at-rule as a container to walk into. That is correct for `@media`, `@supports`, and `@layer`, which hold rules, and wrong for `@theme`, which holds bare declarations the way `:root` does. Walking into it found no inner rule, so every token in it went unscanned. `isRootRule` had anticipated `@theme` since v1.6.0 and had nothing to match.
- Measured before the fix, on byte-identical token sets: `:root{--bg:#FFFFFF;--text:#808080;}` reports `pure-base` and `untinted-neutral` and exits 1; `@theme{...}` reports nothing and exits 0.
- This mattered beyond a parser nit: `@theme` is Tailwind v4's token block, `scripts/extract-tokens.mjs` reads it by design, and `SKILL.md` Step 0 item 1 routes exactly those projects into extension mode. Extension mode could measure a baseline the sweep then could not police.
- One condition now exempts `@theme` from the container path so it is emitted as a block. `@theme inline` is covered by the same word boundary.

### A gate state that had no name: `DEGRADED: no sweep`
- goddesign had carefully drafted words for a missing render (`DEGRADED: no visual check`) and a missing blind read, and none for a missing mechanical gate. Two hosts reach that state: one with no shell, which `SKILL.md` Step 0 supports and Step 3b ships an arithmetic seed for, and one whose install carries the decks but not `scripts/`, which `verify-install.sh` lists as optional and notes.
- The gap was not covered by the existing label. `references/checklist.md` gates `DEGRADED: no visual check` on "Only when every rung fails", so a host that renders natively finishes Phase 3 clean, never fires that clause, and silently never ran Phase 2a, while `SKILL.md` Step 5 still asks for a pass count. `validation/research/design-skills-evaluation-2026-07.md` named that failure class as the defect `sweep.mjs` was built to close; a host that cannot run the script re-entered it with no name.
- `references/checklist.md` now carries the label, the failed command, a `./sweep-handoff.sh` operator handoff mirroring the existing `./audit-handoff.sh` precedent, and the instruction to hand-check every `[sweep]`-marked assertion and report the count as hand-checked. It states explicitly that this is not the same state as `DEGRADED: no visual check`. `SKILL.md` Step 5 names it too.
- The checklist's reporting rule now requires every pass count to say whether it was measured by a script or hand-checked, because a number that does not say which is indistinguishable from a number nobody ran.
- This is a label, not an enforcer, and the record says so: nothing can make a model say it, exactly as with the two existing degraded states. What changes is that the words exist, `lint-decks.mjs` keeps them existing, and an unqualified pass count is now a visible omission.

### Install integrity: presence is not completeness
- `scripts/verify-install.sh` tested that each required file was readable and non-empty. A copied rather than symlinked install, a half-synced tree, or a stale vendored copy therefore passed green while `references/directions.md` held fewer rows than Step 3b's `% 17` rolls, and the seed could select a row that was not there, leaving the model to improvise it. That is the exact failure the script's own header exists to stop, and the check that would catch it (`scripts/lint-decks.mjs`) lives at repo level and never ships inside `skills/goddesign/`, so an installed skill could never run it.
- The script now counts rows in all four seeded decks using the same patterns `lint-decks.mjs` uses, and compares them against the four moduli **grepped out of `SKILL.md` Step 3b** rather than hardcoded, so a deck that grows does not have to be remembered in two places. On mismatch: `INCOMPLETE INSTALL: references/directions.md has 14 rows, SKILL.md Step 3b rolls % 17 (stale or partial copy: reinstall, see docs/INSTALL.md)`, exit 1, keeping the existing exit contract. Still POSIX sh, zero dependencies, no network.
- Verified against three fixtures: a healthy install exits 0, a directions deck truncated to 14 rows exits 1 named, and a palettes deck gutted to zero rows exits 1 named. The gutted case caught a defect in the first draft worth recording, because it was the failure the check exists to prevent: `grep -c` prints its count **and exits 1 when that count is zero**, so `grep -cE ... || echo 0` emitted `0\n0`, the integer comparison errored, and the script reported `install OK` and exited 0. The shipped version branches on the printed count and never on grep's exit status.
- Row counts are not a checksum: a deck with 17 rows where one is corrupted still passes. Counting is what the seed's failure mode needs, since a modulus can only overrun the end.

### Two clarifications in the gate
- The reference-match assertion in `references/checklist.md` compares the render against the comp on layout, spacing, colour, **and medium**. Medium is the axis that quietly goes missing: a comp region reading as a lit, dimensional object that shipped as a flat CSS panel is a deviation like any other, stated or fixed. This is the part of impeccable's medium gate that survives contact with goddesign's one-composition cap; its raster mandate was declined.
- `references/imagery.md` now names which capture the reference-match gate compares the comp against (the 1280 full-page screenshot the audit produces, not a viewport crop), and `SKILL.md` Step 0 item 2 no longer reads as though the three-field stamp comment carries the token values: the stamp names the lock, `:root` holds its values including the Step 3d jitter in relative-color form, and a scoped edit reads both.

### Calibration and tests
- Corpus split across all 49 artifacts in `validation/runs/` and `validation/experiments/`: **1452 findings before, 1452 after, per-file counts identical, `banned-font` 6 before and 6 after.** Zero change is the correct result for both sweep fixes, because they close escapes the corpus never exercised; the proof they work is the fixtures, not the corpus.
- `scripts/sweep.test.mjs` gains three cases, 19 to 22: a system display face fails while the same family in fallback position stays legal; three shapes of system stack fail in position 1 while a fallback tail, `inherit`, and `var()` stay green and raise no `no-webfont`; and `@theme` plus `@theme inline` produce the same findings as an identical `:root` block.
- `scripts/lint-decks.mjs` gains five, 311 to 316: three holding the `DEGRADED: no sweep` label and its handoff across `checklist.md` and `SKILL.md`, and two holding `verify-install.sh` to the deck-row check and to grepping the moduli rather than hardcoding them. All five were negative-tested against the pre-change files, so none passes vacuously.
- Recorded rather than fixed, and pre-existing: `verify-install.sh` relies on word-splitting an unquoted variable, so it misreports when invoked as `zsh verify-install.sh`. Its shebang is `#!/bin/sh` and `SKILL.md` Step 0 documents `sh <skill-root>/scripts/verify-install.sh`, which is the supported invocation and is unaffected.
- Banned bullet 1 is now fully mechanized, which it was not before this release. Other bullets are still only partly enforced, and the gap is named here rather than left to be rediscovered: bullet 4 (the cream plus terracotta reflex, near-black plus acid green), bullet 12 (marker underlines, hand-drawn squiggles), bullet 13 (glassmorphism, emoji as icons, mixed icon sets), bullet 17 (an accent-colored span inside a headline), and parts of bullet 3 (cyan-magenta washes, purple-tinted drop shadows) resolve to strings or counts and have no sweep rule. Each needs its own corpus split and its own false-positive analysis, so none was bundled in here.

## v1.6.1 (2026-07-31)

The correction release. No rule, script, deck, or gate behaviour changes; this release fixes the evidence record.

### Evidence correction: one kilnhouse baseline withdrawn
- `validation/runs/kilnhouse-2026-07/codex-baseline-kilnhouse.html` / `.png` are withdrawn as a contaminated capture and renamed with a `WITHDRAWN-` prefix. The files are kept byte-unchanged; nothing was deleted. Finding, evidence, and affected claims: `validation/runs/kilnhouse-2026-07/WITHDRAWN-codex-baseline-kilnhouse.md`.
- The artifact was filed as an unskilled Codex baseline but carries a goddesign Persist stamp and reproduces `references/directions.md` row 4 (Retro-Futuristic) verbatim: all six hexes, the font pairing, a character-identical Google Fonts import, the radius, the border alpha, the motion duration, and the neon-glow signature. Six exact hexes plus an identical import string is a copy, not convergence, so the model read the decks from the repository the run happened in. Same failure mode v1.4.0 named for the Study A baselines, in an artifact that predates that runner check.
- It is not a mislabelled skill run either: no Step 3d jitter (zero `--*-source` tokens, and the stamp records the un-jittered row accent), a structure that contradicts the brief (Long Document is a 65ch essay column), honesty violations intact, and both genuine Codex skill runs already present under their own names. It read the decks without running the gate, so it is neither arm of the comparison.
- Confirmed mechanically by the repo's own v1.6.0 sweep: the artifact scores 0 failures, alongside the skill runs, while every one of the 18 other unskilled and frontend-design artifacts fails at 6 to 70. The v1.6.0 corpus-calibration line already excluded it without saying so; the README now says so.
- Claims corrected in place, originals left recoverable: the run README's codex-baseline results row; defect 4 ("codex-baseline improved"), now void, since the improvement it measured was the deck leaking in; defect 5's convergence and baseline-variance conclusion, now void, with its blank-render denominator corrected from 2-of-3 to 2-of-2; and the repository README's "three unskilled baseline runs", now two. The measured-audit corpus results, the seven-distinct-directions claim, the A-vs-B test, the steering and renderer-chain tests, the 3-vs-3 head-to-head, and the sealed Study A manifest never rested on it and are unchanged.

## v1.6.0 (2026-07-31)

The enforcement release. goddesign's QA gate had three phases, and only one of them was mechanical. Phase 1 is advisory by construction. Phase 3 is measured by `scripts/audit.mjs`, which needs Playwright and a browser and exits 2 without one. Phase 2, the pass/fail half meant to hold everywhere, was 40-plus assertions executed by the model that had just written the code, including the ones written as literal greps. In a sandbox, where the audit cannot run, a run could be declared gate-passing with nothing objective behind it. This release moves the greppable half to a script. No visual rule, craft-floor number, or banned pattern changes.

### The mechanical sweep
- `skills/goddesign/scripts/sweep.mjs`: 29 deterministic rules over source (`.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`), reporting file, line, and the offending value. No browser, no network, no model, no dependency. Exit 0 green, 1 named failures, 2 nothing scannable. `--rules` prints the table, `--json` emits machine-readable output.
- Rules: banned faces, mono in the body or display slot, Space Grotesk, silent font fallback, the indigo-violet family, gradient text, metallic premium shorthand, pure `#000`/`#FFF` bases, achromatic neutrals, hexes outside `:root`, `transition: all`, stray `!important`, inline styles, container accent stripes, `<hr>`, numbered chapter cadence, the band metronome and its 2x padding ratio, the reveal cascade, missing `:focus-visible`, missing `prefers-reduced-motion`, buzzword copy, em and en dashes in copy, the missing stylesheet stamp, token drift, off-scale spacing, the stock ornament kit, markup color literals, and reasonless waivers.
- Severity splits `fail` from `advisory`. Advisories never fail the gate because each has a legal case a script cannot read: a mono face in the slot a direction row states, a spacing value that is a grammar break declared in the lock, an ornament the locked row names.
- Waivers are inline, file-scoped, and must state a reason: `/* goddesign-allow: metallic-premium the Art Deco row is the one row that states metallics */`. A reason under 8 characters is itself reported as `waiver-without-reason`, so the escape hatch cannot be used silently.
- Comments are blanked before every rule scan (indices and line numbers preserved), so a DIRECTION LOCK block quoting a banned hex, or a note reading "the one allowed `!important` kill switch", is never a finding. Waivers are read first, off the raw text.

### Extension mode, measured instead of inferred
- `skills/goddesign/scripts/extract-tokens.mjs`: reads W3C design-token JSON (including the `tokens/*.json` skillui emits), CSS custom properties, `@theme` blocks, Tailwind config, and `@font-face` and import declarations. Resolves the five DIRECTION LOCK role slots plus border, and reports fonts, radii, spacing, imports, and the palette by frequency. A role it cannot resolve is named as unresolved, never guessed. Exit 2 (`NO DESIGN SYSTEM FOUND`) is the greenfield answer: roll the seed and take the full path.
- `sweep.mjs --tokens <baseline.json>` reports every hex, font, and radius the build introduced that the baseline does not have. Step 0 item 1 and the QA gate now state extension mode as values rather than as a comparison done by eye.

### Gate wiring
- `references/checklist.md`: Phase 2 splits into 2a (run the sweep, fix what it names, lock frozen) and 2b (the assertions needing judgment, a render, or the lock in hand). Assertions the sweep decides are marked `[sweep]`. The rule table, waiver syntax, and the extension-mode two-command loop are documented there.
- The sweep and the audit are stated as complements: static analysis cannot see a collision, a clipped label, or a blank band; a render cannot see a banned value behind a lock that never shipped. Neither one green makes the other unnecessary and neither one unavailable excuses skipping the other. A `DEGRADED: no visual check` run must now report which half of the gate did run.
- `SKILL.md` Step 0 item 1 and Step 5 route through the two scripts; `verify-install.sh` lists both as optional (the run degrades honestly without them).
- `scripts/lint-decks.mjs` gained 95 checks, from 215 to 310. The script's rule table and the deck's rule table are one contract in two files: every rule id and severity must appear in both, and a rule documented but not implemented fails the build.

### Corpus calibration
- Both scripts were run over the whole existing validation corpus. 14 of 19 goddesign artifacts exit 0; the five with findings carry six failures in total, and every one was inspected and is a true positive against a rule the skill already had (a numbered chapter cadence the ban post-dates, a raw hex in `.btn-primary:active`, an em dash in copy, a 3px colored left border on a container, two distinct section paddings where the gate wants three). All 18 unskilled and frontend-design artifacts fail, at 6 to 70 findings each.
- Four false positives were found and fixed during calibration, and a fifth rule was narrowed rather than removed: a colored side border is reported only on a container, so a drawn rail or route line is not a card stripe.
- `scripts/sweep.test.mjs` plus a CI step: 19 executable tests covering the rule table, the waiver contract, each fixed false positive, the extraction round trip, and the corpus separation itself, so the calibration is asserted on every push instead of claimed in prose.
- This is a false-positive and separation check on artifacts that already existed. It is not predictive evidence, and the evidence badge is unchanged.

### Evaluation record
- `validation/research/design-skills-evaluation-2026-07.md`: the borrow-and-decline record for three public design skills. impeccable (pbakaus, Apache 2.0) supplied the deterministic-detector diagnosis, the severity split, and inline waivers; skillui (amaancoderx, MIT) supplied static token extraction; ui-ux-pro-max (nextlevelbuilder, MIT) supplied token-conformance validation as a gate.
- Declined: impeccable's 23-command surface, its four modes (advice, not mechanism), its per-host edit-time hook manifests (four host-specific config files against a documented host-agnostic constraint), its live browser mode (a network service core design work must not need), its PRODUCT.md/DESIGN.md context layer, and its 59-rule registry (on the evidence bar, not on quality: a tell enters goddesign through three sourced complaints or a reproduced defect). Declined from ui-ux-pro-max: the 84-style and 192-palette catalogue (uncapped decks cannot carry the accent and depth caps `lint-decks.mjs` enforces) and the requirements-to-pattern generator (the convergence engine this skill exists to fight). Declined from skillui: the URL crawl, ultra mode, and `.skill` packaging (the network half).
- No text, code, rule definition, prompt content, or data file was copied from any of the three. Both new scripts implement goddesign's own checklist and Banned list.
- `CONTRIBUTING.md` gained the mechanization step: a statically detectable tell now becomes a sweep rule and a checklist row in the same change, with its corpus split reported in the pull request. A rule that fires on the clean corpus is narrowed, never merged with a note.

## v1.5.0 (2026-07-31)

The scope release. Every mechanism in goddesign was scoped to a single run, and the only artifact that outlived a run was a ledger whose job is to make the next run differ. This release adds the missing scale: an effort too big for one session. Nothing about a single-surface design run changes.

### The design map
- `skills/goddesign/references/map.md`: a new required deck. An effort naming 3 or more distinct surfaces, stating a hand-off, or finding an existing `.design-map.md` charts a map first: a **Destination** that fixes the scope, one **System lock** (a DIRECTION LOCK rolled once, jitter included, that every surface inherits verbatim), **Surfaces locked** as links plus one-line gists, **Surfaces to design** each carrying its one action, audience, and claim slot, **Not yet specified** for fog, **Out of scope** for work past the destination, and **Open questions** for the facts only a person can supply.
- Charting is one session and produces no pixels. After that, one surface per session, gated in full.
- The threshold is deliberately narrow: two surfaces or fewer in one session skips the map, and charting that surfaces fewer than 3 specifiable surfaces ends by deleting the map and designing directly.

### Three inversions the map fixes
- **The seed rolls once per map**, at charting, not once per surface. Surface sessions never re-roll, never re-jitter, and never re-read `directions.md`; siblings shipping different accents was the failure this prevents.
- **Rotation matches instead of differing.** Step 3a exists to push the next run off the last one, which is right across projects and backwards across the surfaces of one product. Under a map it applies at charting only.
- **One ledger entry per map, not one per surface.** Nine surfaces written as nine entries trip the Step 3a popularity cap by the third surface and fill the entire 8-entry rotation window with one project. The entry is written when the map's last surface locks.

### Human-only facts stop stalling and stop being invented
- Step 2 says invent confidently where the brief is silent; Step 4c forbids inventing metrics, testimonials, logos, and company names. Under a map, a surface never blocks on the collision: it ships a placeholder labeled as a placeholder and parks the dated question under **Open questions**. These are the only map items an agent may not answer itself.

### Mechanical enforcement
- `skills/goddesign/scripts/verify-map.mjs`: validates the eight required sections and their order, the System lock's seven fields and five hex tokens, every surface line's shape, claim format (`no` or `YYYY-MM-DD <host>`), dated open questions, and one-surface-one-state. Exit 0 green, 1 named failures, 2 no map. Prints the owed-ledger-entry reminder when a map completes.
- `scripts/lint-decks.mjs` gained 17 checks binding the deck, the validator, and the skill wiring together: the validator's required-section list is read at lint time, so the deck's template and the script cannot drift apart.
- `references/checklist.md` gained a Map gate group (claim taken before work, lock inherited verbatim, sibling accent and fonts identical, macrostructure differs from the previous surface, fog graduated, no premature ledger entry), and Phase 1 axis 6 now inverts under a map: drifting from the system scores 1, and so does shipping the previous surface's skeleton with new copy.
- `references/map.md` joins the required set, so `verify-install.sh` now checks eight decks rather than seven.

### Dependency advisories (unrelated to the map; CI had gone red since v1.4.0)
- `react-server-dom-webpack` 19.2.6 to 19.2.8, with `react` and `react-dom` 19.2.6 to 19.2.8 to satisfy its peers, clearing GHSA-wx67-qw84-cm4g (react-server-dom denial of service in server functions). Every peer range still holds: `next@^16.2.11` accepts `^19.0.0`, `vinext@0.0.50` accepts `^19.2.6`.
- `brace-expansion` pinned per major line by override (`^1.0.0` to 1.1.18, `^5.0.0` to 5.0.9), which clears GHSA-3jxr-9vmj-r5cp and the 5.x line.
- The remaining 9 advisories are the eslint toolchain, reachable only through `minimatch@3.1.5` (the last 3.x release, pinned to `brace-expansion ^1.1.7`). GHSA-mh99-v99m-4gvg lists no patched 1.x, and 5.x cannot substitute: its CommonJS build exports an object, so `minimatch@3` throws `expand is not a function`. Verified, not assumed. The npm-suggested fix (eslint 10, semver major) does not clear it either, because `eslint-config-next@16.2.6` still pulls `minimatch@3` through eslint-plugin-import, jsx-a11y, and react.
- So the CI gate is now scoped rather than weakened: `npm audit --audit-level=high --omit=dev` blocks on the production surface that actually ships to raters (currently zero advisories at any severity), and a second non-blocking step runs the full tree so dev-only drift stays visible in the logs.

### Evaluation record
- `validation/research/wayfinder-evaluation-2026-07.md`: the borrow-and-decline record for the wayfinder skill (mattpocock/skills, MIT). Seven structural disciplines shipped. Declined: the issue-tracker substrate (core design work depends on no account or network service), blocking edges (design surfaces are an ordering, not a dependency graph, once the System lock exists), the four ticket types and their sub-skills (another skill's ecosystem; only the human-in-the-loop distinction survives), parallel research subagents (same cost and Codex-guarantee reasoning that declined ADHD's fan-out), and planning-by-default (the inversion that would turn a design skill into a planning skill). No text or code was copied.
- The record states the mechanism's weight honestly: it is derived from rules already in the skill and verified mechanically, not from a failing validation run, and no multi-surface map has been run end to end yet. It ships with a kill criterion recorded in advance.

## v1.4.0 (2026-07-23)

The evidence-readiness release: the skill's own review surfaced that every claim rested on author-run validation and a self-graded gate. This release fixes the process, not the pixels.

### External validation (the evidence gap)
- `validation/protocols/external-validation-protocol.md`: three pre-registered studies with bars fixed in advance and publish-either-way de-identified row-level data. Study A: blind identification test (30 anonymized samples: 10 goddesign, 10 unskilled baselines, 10 human-built; 20+ outside raters; goddesign must be indistinguishable from human-built and below baselines on AI-identification). Study B: five-brief matrix across categories (dashboard, portfolio, e-commerce, docs, event). Study C: cross-model replication of the EXPAND lane on Codex, which to date has no independent receipts.
- `scripts/study-a-pack.mjs` plus `validation/tools/blind-eval-pack.sh`: atomic Study A packer. Validates all 30 artifacts, matched hosts, green audits, and unique skill directions; strips method comments without deleting neighboring CSS; assigns cryptographic sample IDs; records SHA-256 integrity digests; seals arm metadata; and produces two balanced twenty-rater waves. Verified by executable tests.
- `scripts/study-a-capture.mjs`, `study-a-run-hosts.mjs`, `study-a-build-corpus.mjs`, `study-a-sync-rater.mjs`, and `study-a-links.mjs`: live control capture, isolated same-host skill and baseline execution, corpus assembly, deployment sync, and signed invitation generation.
- `study-a-rater/`: persistent de-identified study application with eligibility and consent, signed invitation slots, fifteen-sample resume, per-answer D1 persistence, strict response validation, and secret-protected operator CSV export.
- `scripts/study-a-analyze.mjs`: paired equivalence and baseline-superiority analysis. It rejects an incomplete or unbalanced study, flags duplicate, malformed, impossible-time, and possible-automation submissions without silently excluding integrity flags, reports sample-level failure rates, and publishes either verdict.
- The analyzer now reproduces the frozen statistics from its own de-identified public rows, emits the exact reproduction command, creates a SHA-256 publication manifest, and keeps private submission IDs in a sealed integrity file. Deterministic repeated words and two-word phrases from goddesign AI-yes reasons become explicit recalibration inputs.
- Live execution receipts now cover all ten human-control captures and all ten frozen generated pairs across Codex and Claude Code: ten green skill audits, ten same-model baselines, ten distinct direction rows, and eighty verified generated-artifact hashes.
- Every baseline was regenerated in a neutral temporary workspace after a Claude run exposed repository-path contamination. The runner rejects method markers before copying an artifact into evidence, and the corpus builder and receipt generator refuse legacy method-path baselines.
- The frozen 30-sample corpus and one balanced 40-slot blinded pack are complete. Its sealed manifest hash is `ca15b3113f9a4ab538f4ec047f8257f10bfe34425ac939dda4f768530d90b99b`.
- The rater application passed a full local D1 integration run with twenty signed development slots, three hundred persisted ratings, completion enforcement, secret-protected export, de-identification, exact tests, bootstrap, report generation, and zero integrity flags. The data was a synthetic test oracle and is not external evidence.
- Participant-visible payloads now use a neutral runtime study ID, and the built client bundle is scanned for method-name leaks. The protocol also rejects a participant hostname containing the method name.

### QA gate hardened
- Phase 1 self-critique demoted to advisory with mandatory evidence citations (every score cites the element, line, or screenshot region that earns it; uncited scores record as 1). The pass/fail gate is now explicitly Phase 2's boolean sweep plus Phase 3's measured audit, the two objective halves.
- Blind read promoted from optional to default-when-an-image-CLI-exists; skips require a stated reason recorded as `DEGRADED: no blind read (<reason>)`. Verdict stays advisory per the calibration finding.

### Process cost
- New Step 0 mode: scoped edits on a page already carrying a `/* goddesign | */` stamp reuse the stamped lock and skip Steps 2-3 (craft floor and full gate still apply). New pages, new macrostructures, or direction changes take the full path.
- No-shell seed fallback now sums the brief's character codes instead of counting its length; two same-length briefs on one day no longer collide on every pick.

### Deck treadmill
- Popularity cap in Step 3a: a direction appearing 3+ times, or a macrostructure 4+ times, across both ledgers' last 8 entries rests for a run.
- `CONTRIBUTING.md` genome intake expanded into a five-step extraction recipe (capture evidence, type system, palette breaks, grammar habits, density rhythm, signature, imperfections) so any user can contribute a human-genome row, not just the maintainer.

### Rule honesty and CI
- Every Banned-list entry is tagged [fingerprint] (avoided because the public recognizes it on sight) or [craft] (a defect no matter who ships it), so evidence-backed claims are distinguishable from taste.
- Step 0 now runs `scripts/detect-clis.sh`, a presence-only inventory for Codex, Claude Code, Cursor Agent, Cursor, Gemini CLI, OpenCode, Aider, Goose, GitHub Copilot, Amp, Amazon Q, Kiro, and Factory Droid. It distinguishes a desktop editor launcher from a headless agent and does not treat installation as proof of authentication or capability.
- CLI discovery is advisory only. Core design work remains independent of any editor, agent, model vendor, deployment platform, account, domain, DNS configuration, or network service.
- Host scope is now prompt-specified: one capable host receives the full QA gate and full score by default. Cross-host work runs only when the prompt explicitly requests comparison, replication, or compatibility testing, with named maintainer validation protocols as the only non-prompt exception. A missing second host never lowers the design score.
- `scripts/lint-decks.mjs` plus `.github/workflows/ci.yml`: 196 mechanical checks on every push. Deck sizes match SKILL.md seed moduli, every direction row is a complete package, every Banned bullet has an INSTEAD and a tag, host-scope guarantees and genome vantage caps hold, and no em/en dashes appear in prose.
- `validation/` is organized by purpose into `research/`, `protocols/`, `experiments/`, `runs/`, `studies/`, and `tools/`, with a root index and self-contained dated run directories.
- Repo hygiene: stray `.DS_Store` files removed (`.gitignore` already covered them).

## v1.3.0 (2026-07-22)

The seams release: three of the four ADHD-surfaced leverage seams implemented after the first (seeded subject-vantage) was tested and rejected. Full evaluation: `validation/research/adhd-evaluation-2026-07.md`.

### Install integrity (seam 3)
- `scripts/verify-install.sh`: host-neutral POSIX check that `SKILL.md` and the seven `references/*.md` decks are present and non-empty (exit 0 OK, exit 1 with `INCOMPLETE INSTALL: <file> not found`). A partial install can otherwise let the model improvise missing rows, recreating the model-authored distribution the skill exists to escape.
- SKILL.md Step 0 preflight and a Step 3c stop-rule enforce the same lazily on hosts with no shell; INSTALL.md documents the verify command.

### Blind post-render critic (seam 4)
- `scripts/blind-read.sh` + `references/blind-read.md`: a separate process sees ONLY the screenshots (never the code or the DIRECTION LOCK) and reconstructs the page's structure, paper band, display class, accent band, signature, subject, and one AI tell, closing the gap where Phase 1 self-critique is authored by the context holding the answer key.
- Shipped OPTIONAL and degrade-friendly (`DEGRADED: no blind read` with no penalty), wired into checklist.md Phase 3 as a Specificity aid, not a hard gate. Calibration on four owner-ranked Bandquarter renders (`validation/experiments/blind-read-calibration-2026-07/README.md`) showed accurate subject and signature recovery every time but no winner-from-loser separation, so it ships as an identity-recovery check, not a ranker.

### Genome sourcing intake (seam 2)
- `references/genome-sources.md` (ten maintainer-only sourcing vantages, never read during a design run) plus a `CONTRIBUTING.md` intake rule that formalizes the pre-existing prose provenance requirement into a schema: new genome rows carry `Genome: vantage=<0-9> | source=<domain> | captured=<YYYY-MM>`, with grep-checkable caps enforced in review (at most two rows per vantage; the two newest must not share one) so the human-genome lane keeps spreading instead of re-converging. Row 16 is grandfathered (`source=unrecorded-preschema`).

### Not adopted (seam 1)
- The seeded subject-vantage (seed the Subject test before the aesthetic deck) was tested across three subjects and rejected: it reliably diversifies the signature but does not beat the current Subject test on product-page quality (owner tie, then two proxy losses to the control). Recorded in `validation/experiments/subject-vantage-2026-07/README.md`; the Subject test and its "show the product working" clause hold unchanged.

## v1.2.1 (2026-07-22)

The evaluation release: an external skill assessed against the evidence bar, with no skill changes.

### Evaluated and declined (ADHD)
- The ADHD reasoning skill (UditAkhourii/adhd, MIT) was evaluated as a candidate to borrow from via a four-phase multi-agent investigation (four recon readers, thirty proposals across six angles, a four-lens adversarial attack on every candidate, synthesis on Codex gpt-5.6-sol xhigh). Full record: `validation/research/adhd-evaluation-2026-07.md`.
- Verdict: borrow the diagnosis, decline the cure. ADHD and goddesign fight the same enemy (convergence) with opposite medicine; ADHD's parallel fan-out multiplies the model distribution the skill exists to escape, costs five to ten times a run, and cannot be guaranteed on the Codex host. Declined: the fan-out, the score chips, and the 0.35 / 0.40 / 0.25 weighting.
- Four leverage seams recorded as hypotheses with kill criteria, none shipped: seed the Subject test before the aesthetic deck (highest value), point cognitive frames at human-genome sourcing rather than new authored rows, fail loudly on an incomplete install, and prototype one blind post-render critic. The seam-1 validation experiment is the recorded next action; nothing enters the skill until it earns a blind owner ranking.
- Benchmark treated as hypotheses, not admission evidence: `bench/results.json` has four problems, one sample per arm, no significance test, a trap-detection metric that is a format artifact, and one showcase problem won by the baseline (builder usefulness 9 versus 4).

## v1.2.0 (2026-07-18)

The avenues release: new ways for a design to come into being, plus trust.

### Conception avenues
- Comp-first mode (owner's idea, proven end to end same day): when an image tool is available, generate one lock-derived full-page mockup and replicate it in HTML; the comp governs composition, the lock governs values, comp text is never transcribed. Recommended by default on the EXPAND lane. Proof pair archived (comp and replication) in `validation/`.
- Conception map: a single page may mix up to three conception avenues per section (comp, artifact-first, human-genome grammar, copy-first), declared in the lock; mixed conception, never mixed identity: every avenue executes the same lock.
- SVG-first experiment: FAILED and recorded plainly (page-scale hand-placed coordinates misalign; top-level file:// SVGs with remote font imports hang renderers). No skill changes; the test-first protocol contained it.

### Trust (from a controlled 48-participant study, Martinovikj 2025, cited in validation/research/external-evidence-2026-07.md)
- Credibility added as the seventh self-critique axis: the study's one replicated finding is that AI-built sites lose Trust/Security and Credibility/Professionalism in every pair while winning polish dimensions.
- Trust-surface gate: every page answers who is behind it, how to reach them, and the material terms; sample-labeled in demos, truthful in real projects.
- The study's suspicion inversion (the human agency site was most suspected of being AI, because polished generic layouts read as AI) recorded as third-party validation of the grammar program.

### Calibration
- The no-skill baseline's high appeal recorded honestly: appeal and tells coexist; the skill's bar is raw Claude's best day plus honesty, correctness, and non-repetition.

## v1.1.0 (2026-07-18)

The owner-taste release: five comparative validation rounds in one day, each owner verdict compiled into mechanism the same day.

### The taste loop
- Subject test (Step 4b): the signature element and at least one motif must be artifacts of the subject's world drawn in the locked direction's formal language; the page must show the product working.
- Substance gate: at least one structured artifact of the product working per page; pure-assertion pages fail regardless of typographic beauty.
- Atmosphere layer: the row's background treatment is mandatory ground treatment (texture, depth, overlap), exempt from the signature budget; flat band-stacks of rectangular panels fail.
- Audience-fit remix trigger in Step 3c.

### The grammar system
- Forensics on 5 real Claude-built production sites plus 7 test runs identified seven grammar tells that survive font/palette/structure rotation (band metronome, eyebrow ceremony, three-caste type, rationed accent with headline spans, uniform finish, symmetrized content, stock ornament kit). Evidence: `validation/research/claude-grammar-2026-07.md`.
- Counters encoded: mandatory declared grammar breaks (container escape, ceremony-free section, orphan cells, padding variance with the global `section { padding }` rule banned), stock-ornament-kit and headline-accent-span bans, and a seven-line Grammar gate group in the checklist.

### Deck integrity (three clustering axes caught by the owner, all capped)
- Accent hues rebalanced (Brutalist to magenta + Syne, Cinematic to ice, Neobrutalist to green, Industrial off gold to safety orange) with a 2-rows-per-hue-band authoring cap.
- Depth-language uniqueness: hard offset shadows exclusive to Neobrutalist, sticker outline to Playful Pop, tilt to Lo-Fi Riso; the offset-shadow-plus-tilt-plus-chips kit is a flagged Claude default.
- Cross-project user ledger (`~/.design-log.json`): rotation constraints now hold across all of a user's projects, with a no-3-in-a-row rule on accent and paper bands.

### The human-DNA lane
- Deck row 16 "Trade Counter": the first direction derived from a real human-built site rather than authored by Claude (single-family weight-driven type, full-coverage accent bands, diagonal cuts, phone-forward, no heading ceremony). Deck moduli updated 16 to 17 everywhere. Human-genome rows are the structural answer to "a model cannot author its way out of its own distribution"; more rows land as the owner supplies admired sites.

### Triggering and docs
- Automatic triggering: trigger vocabulary in the skill description plus standing-instruction snippets for `CLAUDE.md`/`AGENTS.md` (docs/INSTALL.md); the command is optional.

### Evidence
- Four comparative rounds archived (`validation/runs/`): goddesign 12 of 12 external audits green with no repeated identity; the official frontend-design skill 0 of 12 with per-domain concept/font/palette convergence (one display font shared across 11 of 12 of its runs). Round 5 ended in the owner's first goddesign 1-2 finish, under the full stack.

## v1.0.0 (2026-07-18)

First public release.

### The skill
- Two-lane design: DIVERGE (seeded picks + reroll rule + steering override for taste-heavy models) and EXPAND (fully enumerated decisions + named failure symptoms for literal-execution models).
- Variance engine: seed-indexed decks (16 directions, 12 macrostructures, 10 palettes, 12 type pairings), per-project run ledger, and seeded jitter (accent hue rotation, paper lightness nudge, radius step via CSS relative color) for population-scale uniqueness.
- DIRECTION LOCK accountability format; numeric craft floor; evidence-derived Banned list with INSTEAD replacements.
- Gated imagery: cross-host image generation with lock-derived prompts, honesty rules, and a two-regeneration cap.

### Verification tooling
- `scripts/audit.mjs`: measured per-viewport audit (overflow, text collisions, hidden-content reveal bugs, sub-24px targets, silent font fallbacks) with screenshots and JSON verdicts.
- Bounded self-correction loop: audit-named failures only, lock frozen, maximum 3 cycles.
- `scripts/codex-audit-loop.sh`: sandboxed-Codex operator wrapper (build inside, audit outside, resume-feedback into the same session) plus machine-readable `audit-handoff.sh` on DEGRADED runs.
- `scripts/genimage.sh`: image-generation delegation chain (Codex rung verified; extensible).

### Evidence
- 346-comment verified public-sentiment study with per-quote source URLs and verification tiers (`validation/research/sentiment-evidence-2026-07.md`).
- Full validation round: 7 distinct gate-passing skill runs vs 3 baseline runs reproducing the catalogued failures, all artifacts archived (`validation/runs/kilnhouse-2026-07/README.md`).
- Repeatable catalog-refresh protocol (`validation/protocols/sentiment-refresh-protocol.md`).
