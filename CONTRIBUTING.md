# Contributing

goddesign's credibility rests on one rule: every load-bearing claim has receipts. Contributions are welcome when they clear the same bar the existing content had to.

## Proposing a new tell (banned pattern)

A tell is admitted only with evidence, not taste:

1. **Evidence**: at least 3 independent, sourced public complaints (URLs required), or a defect reproduced in a validation run. The collection method is documented in [validation/protocols/sentiment-refresh-protocol.md](validation/protocols/sentiment-refresh-protocol.md).
2. **Encode in three places**: the DIVERGE lane's attractor list in `SKILL.md`, the Banned list (with an INSTEAD that points back into the seeded deck, never at a specific alternative look, and a [fingerprint] tag), and a greppable string or yes/no assertion in `references/checklist.md`. Pure quality rules (contrast, targets, states) take a [craft] tag instead and enter the craft floor or the gate without touching the attractor list.
3. **Mechanize it if it is statically detectable**: if the pattern resolves to a string, a number, or a count in source, it becomes a rule in `skills/goddesign/scripts/sweep.mjs` and a row in the Phase 2a table in `references/checklist.md`. Those two are one contract in two files and `scripts/lint-decks.mjs` fails when they drift, so add the rule id and its severity to both in the same change. Choose `advisory` when the pattern has a legal case the script cannot read (a row that states the face, a grammar break declared in the lock); choose `fail` only when no lock line can make it correct. Then calibrate: run the new rule across `validation/runs/` and `validation/experiments/` and report the split, because a rule that fires on the clean corpus is a false positive, not a stricter gate.
4. **Deck check**: grep the reference decks for rows embodying the pattern. A row where the pattern is the stated concept is a legal exception; anything else needs fixing in the same change.
5. **Record**: add the evidence with source URLs to a dated file in `validation/`.

## Adding a direction row

- Rows are complete packages: colors (hex), fonts with a working import line, radius, shadows, background treatment, one signature element, motion numbers. No field left as an adjective.
- Accent distribution: no more than 2 rows per 30-degree accent hue band, and no two rows may share both a paper band and an accent hue band unless their saturation classes differ sharply (a candy pink and a deep oxblood are not confusable; two saturated red-oranges are). No two rows share a display font family or superfamily.
- Depth-language uniqueness: each shadow/depth treatment belongs to exactly one row (hard offset shadows: row 14 only; sticker outline: row 10; soft layered tinted: one dark row and one light row at most; none-plus-rules for the rest). The hard-offset-plus-tilt-plus-chips kit is Claude's native default and reads as "a frontend-design variant" the moment two rows carry it; the owner caught this across three rounds. Tilt as a stated device: one row (Lo-Fi Riso misregistration). The deck was rebalanced 2026-07-18 after the owner caught repeated pairings surviving the seed.
- Verify the Google Fonts import URL answers 200.
- Check the row against the entire Banned list; a banned pattern may appear only as the row's stated concept.
- Update every seed modulus if a deck's size changes (`SKILL.md` Step 3b and its no-shell fallback): the moduli must always match deck sizes.

## Contributing a human-genome row

Rows 16+ are derived from real human-built sites, not authored. This lane is the deck's long-term defense against becoming its own fingerprint, so the recipe is written for contributors who are not the maintainer. Any user can extract a genome from a site they admire and propose it as a PR.

Extraction recipe:

1. **Pick the site** from a stated sourcing vantage in `skills/goddesign/references/genome-sources.md` (a maintainer-only file, never read during a design run). The site must be human-built and shipped; a design-gallery mockup is not a genome.
2. **Capture evidence**: full-page screenshots at 375, 768, and 1280, plus the computed styles of five elements: body text, the h1, one label or kicker, one button, the footer. These are your receipt that values came from the site, not from memory.
3. **Extract the genome**, every field as values, never adjectives:
   - Type system: families and weights in use, the measured size ratio between display and body, and whether one family does everything (single-family systems are the most common human pattern and the rarest AI one; record them when you find them).
   - Palette relationships: the exact neutrals and their chroma, where the accent actually appears, and above all where the site breaks polite defaults (accent on body text, a band ignoring 60-30-10, two hues that should clash and do not). The breaks are the genome's signal; the polite parts are already in the model.
   - Grammar habits: how sections open, the padding rhythm (measure three sections), how many container widths exist, what is left misaligned on purpose.
   - Density rhythm: measure the shortest and longest sections; human pages are uneven.
   - Signature devices: the one element only this site has.
   - Imperfections: keep them. They are load-bearing, and the row must say where they live.
4. **Encode as a complete row** meeting the direction-row bar above (colors, fonts with a working import, radius, shadows, background, one signature, motion numbers), with a "do not polish the human traits away" note at every point where the genome contradicts model instincts.
5. **Check the caps**: accent-distribution and depth-language caps like any row, plus the vantage caps below. Verify the import URL answers 200. Update every seed modulus if the deck size changed.

Sourcing intake (so the lane keeps spreading instead of re-converging). A prose provenance line was always required; v1.3.0 formalizes it into a machine-readable schema and adds sourcing vantages and caps. Left to instinct a maintainer keeps sampling the same admired corner of the web, and the sourced rows re-converge, which defeats the whole point of an out-of-distribution lane. Every genome row added from v1.3.0 on carries this provenance line (row 16 predates the schema and is grandfathered with the fields still recoverable, `source=unrecorded-preschema`):

```
Genome: vantage=<0-9> | source=<domain> | captured=<YYYY-MM>
```

Caps, grep-checkable against `references/directions.md` and enforced in review (there is no runtime enforcer): at most two genome rows share a `vantage=` value, and the two most recently added genome rows must not share one. `source=` is the real site's domain (evidence of a human-built origin, not a design gallery). This is deck-maintenance only; it changes nothing in a design run, so both hosts stay identical.

## Changing scripts

`audit.mjs`, `sweep.mjs`, `extract-tokens.mjs`, `codex-audit-loop.sh`, `genimage.sh`, and `verify-map.mjs` must stay dependency-light, degrade gracefully (clear message + documented exit code), and remain host-neutral. Test against the defect corpus in `validation/` before and after: the audit must still catch the known collisions and reveal bugs, the sweep must still separate the skill runs from the baselines, and both must still pass the known-clean runs.

`sweep.mjs` has one extra rule of its own, because a source scanner that cries wolf gets ignored and then the gate is worse than before it existed. Comments are not code (the script blanks them before every scan, so a lock block quoting a banned hex is not a finding), waivers are read before the blanking and require a stated reason, and every new or changed rule reports its corpus split in the pull request: how many of the goddesign artifacts in `validation/` it fires on, and how many of the baselines. A rule that fires on the clean corpus is fixed or narrowed, never merged with a note.

## Changing the design map contract

`references/map.md` documents the `.design-map.md` shape and `scripts/verify-map.mjs` enforces it. They are one contract in two files, so change both in the same commit: `scripts/lint-decks.mjs` reads the validator's `ORDER` array and fails if the deck stops documenting a required section. A new section means a new heading in the deck's template, a new entry in `ORDER`, and its own check in the validator. The map is structural machinery, so it takes no [fingerprint] or [craft] tag and needs no tell evidence, but it does need the same mechanical bar as every other rule here: a number, a greppable string, or a yes/no test.

## Validation bar for any substantive change

This section is for maintainers changing the skill, not people using it for a design. A normal design run needs one capable host and receives no penalty, lower score, or `DEGRADED` note for lacking another. Cross-host work enters a user task only when its prompt explicitly requests comparison, replication, or compatibility testing.

Run the standard maintainer proof from [validation/runs/kilnhouse-2026-07/README.md](validation/runs/kilnhouse-2026-07/README.md): at least one baseline (expect tells), skill runs on both hosts (expect clean gates), two same-brief DIVERGE runs (expect zero shared ledger axes), screenshots or an honest DEGRADED. Add the artifacts and a dated summary to `validation/`. Changes that touch the README's core claim (output not identifiable as AI-made) additionally follow [validation/protocols/external-validation-protocol.md](validation/protocols/external-validation-protocol.md): author-run proofs move the machinery, only the external studies move the claim.

## Style

- No em dashes, no en dashes, no emojis, anywhere in this repository.
- Every rule you write must resolve to a number, a hex, a greppable string, or a yes/no test. If a literal-execution model cannot verify it mechanically, it is not a rule yet.
