# WITHDRAWN: codex-baseline-kilnhouse (2026-07-31)

`WITHDRAWN-codex-baseline-kilnhouse.html` / `.png` (formerly `codex-baseline-kilnhouse.html` / `.png`) is withdrawn from the evidence corpus as a contaminated capture. The files are kept, byte-unchanged, so the finding stays auditable. They must not be cited as an unskilled baseline.

Round 2 still has two valid unskilled baselines: `claude-baseline-kilnhouse` and `codex-baseline-kilnhouse-2`.

## The finding

The artifact was labelled an unskilled Codex baseline, but its stylesheet opens with a Persist stamp:

```
/* goddesign | structure: Long Document | direction: Retro-Futuristic | accent: cyan 182deg */
/* Locked tokens: bg, surface, text, muted, accent, secondary; radius 8px; motion 400ms ease-out. */
```

Only the skill's Persist step (`skills/goddesign/references/checklist.md`, "Persist the run") writes that stamp. It is the only file among all `*base*.html` and `*fd*.html` artifacts under `validation/runs/` that carries one.

The stamp is not a stray comment. The page is a verbatim execution of `skills/goddesign/references/directions.md` row 4, Retro-Futuristic:

| Row 4 specifies | Artifact ships |
|---|---|
| bg `#05060E`, surface `#101226`, text `#EDEDF7`, muted `#8B8DA6`, accent `#61F4DE`, secondary `#FF6AD5` | all six hexes exact, in `:root` |
| display Michroma 400, body Albert Sans 400/600 | same pairing |
| `https://fonts.googleapis.com/css2?family=Michroma&family=Albert+Sans:wght@400;600&display=swap` | character-identical import |
| Radius 8px; borders 1px rgba(97,244,222,0.25) | `--radius: 8px`; `--line` at 25 percent accent |
| Motion 400ms ease-out; signature neon glow; radial-gradient background mesh | all three present |

Six exact hex values plus a character-identical import string is a copy, not convergence. The structure name is real too: "Long Document" is `references/layouts.md` row 2.

So the model had the repository's decks readable in its workspace. Round 2's method line records the Codex lane as `codex exec, gpt-5.6-sol, reasoning xhigh, workspace-write sandbox`; nothing isolated that run from the repository it was run in. This is the same failure mode v1.4.0 named for the Study A baselines ("repository-path contamination"), found in an earlier artifact that predates the runner check.

## Why this is withdrawn rather than relabelled

The artifact is not a mislabelled skill run either. It read the decks; it did not run the gate.

- **No Step 3d jitter.** Zero `--*-source` tokens. Every genuine skill run in this round derives jittered tokens from row hexes (`codex-skill-kilnhouse` and `codex-skill-kilnhouse-2` both do), and the round README states all skill runs applied Step 3d. This one ships the raw row hexes, and its stamp records the un-jittered row accent (`cyan 182deg`).
- **Structure contradicts the brief.** "Long Document" is one 65ch column for manifests, essays, changelogs, and docs. The brief was a landing page with nav, hero, three feature sections, pricing, and footer.
- **Honesty violations survive in it.** The round README's own description notes "fake UI chrome in every section", which the skill's gate bans.
- **Genuine Codex skill runs already exist and are separately labelled**: `codex-skill-kilnhouse` (Bento Anchor / Luxury Serif / platinum) and `codex-skill-kilnhouse-2` (Stat-Led / Editorial Magazine / oxblood). This file duplicates neither.

A run that copies a direction row and writes the stamp without executing the checklist is neither arm of the comparison. It measures nothing.

## Independent mechanical confirmation

`skills/goddesign/scripts/sweep.mjs` (v1.6.0), run over the corpus on 2026-07-31:

| Artifact | Sweep failures |
|---|---|
| WITHDRAWN-codex-baseline-kilnhouse | **0** |
| codex-skill-kilnhouse (skill run) | 0 |
| claude-baseline-kilnhouse | 20 |
| codex-baseline-kilnhouse-2 | 55 |
| codex-baseline-taskflow | 57 |
| every other unskilled or frontend-design artifact | 6 to 70 |

The repository's own separation tool scores this artifact with the skill runs, not with any baseline. All 19 unskilled and frontend-design artifacts in `validation/` were swept; 18 fail, in a 6-to-70 band, and the single exception is this file. That matches the v1.6.0 changelog line "All 18 unskilled and frontend-design artifacts fail, at 6 to 70 findings each", which therefore already excluded this artifact without saying so.

## Claims that rested on it

Corrected in place; each correction is listed here so the original claim stays recoverable.

1. **`README.md` (run README), results table, codex-baseline row.** Described the artifact's look as a baseline result. The described look is a deck row.
2. **`README.md` defect 4, "codex-baseline improved."** Claimed gpt-5.6-sol xhigh "no longer ships the unstyled-Bootstrap floor" and that the EXPAND-lane gap is "now mostly taste, template gravity, and discipline rather than raw styling absence." This was the load-bearing claim, and it is void: the improvement measured was the skill's own deck leaking into the capture. The surviving Codex baseline (`codex-baseline-kilnhouse-2`, 55 sweep failures, silent Inter fallback, blank static render) points the other way.
3. **`README.md` defect 5, convergence re-measurement.** "A second identical baseline run did NOT converge on run 1's neon template" and the conclusion that "5.6-sol has more baseline variance than the first validation round measured." Non-convergence between a deck-reading run and a clean run is not a variance measurement. Round 2 has one clean Codex baseline, so it measures no Codex baseline variance at all. The observations about `codex-baseline-kilnhouse-2` itself (cream and terracotta attractor, Inter-first stack with no import, fabricated studio strip, reveal bug) rest on that artifact and stand.
4. **`README.md` defect 5, "2 of 3 unskilled runs ... shipped pages that render blank statically."** Denominator counted this artifact. Corrected to 2 of 2.
5. **Repository `README.md`, evidence summary.** "three unskilled baseline runs reproduced the catalogued failures". Corrected to two.

Not affected, checked and confirmed:

- The measured-audit corpus results (run README, "Measured audit") never listed this artifact; the defects it names come from `claude-baseline`, `codex-baseline-2`, `codex-skill` round 1, `claude-steer`, and skill run B.
- The seven-skill-run distinctness claim, the A-vs-B core promise test, the steering override test, the renderer chain test, and the 3-vs-3 head-to-head against `frontend-design` involve no baseline arm.
- The Study A frozen corpus does not contain this artifact (sha256 `4b5e55e8a43533002e22bb5356fd5726901075b5e77106b06e7409b74d982f40` appears nowhere under `validation/studies/`), so the sealed manifest hash `ca15b311...` is unaffected.
- `scripts/sweep.test.mjs` draws its comparison corpus from the wayfare and ledgerbird directories only, so the CI separation test never asserted on this file and is unchanged by the rename.

## What prevents a repeat

v1.4.0 already added the Study A guards: the runner rejects method markers before copying an artifact into evidence, and the corpus builder and receipt generator refuse legacy method-path baselines. Those guards post-date this artifact and are scoped to the Study A pipeline. The general rule for any future baseline capture: run it in a workspace with no path to the skill, and grep the output for `/* goddesign |` before filing it as evidence.
