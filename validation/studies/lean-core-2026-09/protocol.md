# Lean-core comparison protocol

Status: frozen on 2026-09-26, before any run of any arm. Study ID:
`goddesign-lean-core-2026-09`.

Amendment, 2026-09-26, before any run: the per-run caps rise from $20 and 45
minutes to $40 and 90 minutes. Two smoke runs of brief L01 outside this study,
one per skill version, took about 25 minutes to write a first page and longer
to finish their gates, so the old caps could have stopped the heavier arm
mid-fix-loop and biased criterion 2 toward the lean core. The caps exist to stop
runaway loops, not to constrain a normal run. Also before any run, the harness
learned to run cells concurrently (`--jobs`; cells whose skill reads the home
ledger still take turns), to strip a launching Claude Code session's
environment so `CLAUDE_EFFORT` cannot override the protocol's effort, and to
re-run only cells whose headless run failed at the API level. No arm, brief,
criterion, or threshold changed.

## The question

v2.0.0 cut the instructions a frontier model reads on a design run from about
95 KB (v1.8.0) to about 16 KB, on the argument that current frontier models
already do most of what the cut text enumerated, and that the scripts carry the
parts no model can do for itself. That argument was a recommendation, not a
measurement. This study measures it, and fixes in advance what each outcome
changes.

It is a decision tool for one person. The judge is the owner, the briefs are
five, and the result says which setup this owner should run. It is not evidence
for the external claim that outside judges cannot identify goddesign pages as
AI-made; that claim stays unvalidated (see
`validation/protocols/external-validation-protocol.md`).

## Arms

Frozen in `arms.json`. Every arm runs headless Claude Code (`claude -p`) with
`--safe-mode`, so no CLAUDE.md, installed skill, plugin, hook, or MCP server
loads, at the same effort (`high`), with the same scope instructions, in a fresh
temporary workspace.

| Arm | Model | Skill |
|---|---|---|
| A | `opus` (the current frontier Opus) | none |
| B | `opus` | v2.0.0, the lean core |
| C | `opus` | v1.8.0, the full pre-cut skill |
| D | `sonnet` (the current Sonnet) | v2.0.0, which routes Sonnet to the full lane |

Skill arms receive the skill the way a host loads it: the tagged `SKILL.md`
appended to the system prompt with its base directory, and read access to that
directory through `--add-dir`. The prompt is `/goddesign <brief>` for skill arms
and the bare brief for arm A, each followed by the same scope sentence.

Both run ledgers start empty for every run: the harness points the v2 user
ledger at a per-run temporary file and moves `~/.design-log.json` aside for the
duration of each run (v1.8.0 reads that path directly), restoring it afterwards.
Do not run other design sessions on the machine while the study runs.

## Briefs

Frozen in `briefs.json`: five briefs copied verbatim from Study A's set, which
was frozen on 2026-07-23, two months before this decision existed. Categories:
SaaS analytics, single-product commerce, developer documentation, restaurant,
independent magazine. Twenty runs in total.

## Procedure

```sh
node scripts/arm-test.mjs run      # all 20 cells, sequentially; resumable
node scripts/arm-test.mjs pack     # blind pack for ranking
node scripts/arm-test.mjs reveal   # only after ranking.json is complete
```

1. **Run.** Each cell writes to `work/runs/<brief>-<arm>/`: the page, the
   headless run's JSON result (tokens, cost, turns, duration), and the
   harness's own measurement with the v2.0.0 scripts: `sweep.mjs` and
   `audit.mjs`, including the 1280 and 375 full-page captures. A run is capped
   at $40 and 90 minutes; a capped or failed run is ranked on whatever it
   produced, and a run that produced no page ranks last on its brief. The one
   exception is a run that never reached the model (an unparseable result or
   an API error): that is infrastructure, not a result, and
   `run --retry-failed` re-runs it.
2. **Pack.** Each brief's four captures are copied under random codes to
   `work/pack/`, with `RANK.md` to read and `ranking.json` to fill. The code key
   goes to `work/sealed/key.json`.
3. **Rank.** The owner ranks each brief's four pages from best to worst on one
   question: which would you ship? Rank before opening `work/runs/` or
   `work/sealed/`, where arms and costs are visible.
4. **Reveal.** The harness maps codes to arms, applies the criteria below
   mechanically, and writes `RESULTS.md` and `results.json` here. Both are
   committed whatever they say.

## Pre-registered criteria

On a brief, arm X beats arm Y when the owner ranked X above Y. Across the five
briefs, **X is better than Y** when X beats Y on at least 4 of the 5.

1. **Does a frontier model still need the design layer?** If B is not better
   than A, the design layer retires for frontier models: their lane shrinks to
   the scripts (`pick.mjs` for variety, `sweep.mjs`, `audit.mjs`) plus the
   Banned list. If B is better than A, the lean core stays.
2. **Did the cut cost quality?** If C is better than B, the v1.8.0 enumeration
   returns to the frontier lane (every model runs the full lane). Otherwise the
   lean core stands as shipped.
3. **Can the full lane make a cheaper model the right choice?** If C is not
   better than D, and D's median cost per run is at most half of C's, the
   documented recommendation becomes running design work on the cheaper tier
   with the full lane. Otherwise the full lane stays a fallback for literal and
   smaller models only.

Reported for every arm, with no bar attached: median and total tokens, cost,
turns, and wall time; post-hoc audit exit codes; sweep failure counts excluding
`no-stamp` (arm A was never told to stamp); and distinct direction rows among
the skill arms.

## Known limitations, stated in advance

- One judge and five briefs. The 4-of-5 rule is a decision threshold, not a
  significance test.
- Arm A is probably recognizable: it executes no deck row, and the owner knows
  the deck. That weakens criterion 1 more than criteria 2 and 3, whose three
  arms all execute deck rows.
- Model aliases resolve at run time. The harness records the model each run
  actually used, and the results name it.
- A single run per cell. Run-to-run variance is not measured; if a criterion is
  decided by one brief, the results say so.
