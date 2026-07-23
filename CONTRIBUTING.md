# Contributing

goddesign's credibility rests on one rule: every load-bearing claim has receipts. Contributions are welcome when they clear the same bar the existing content had to.

## Proposing a new tell (banned pattern)

A tell is admitted only with evidence, not taste:

1. **Evidence**: at least 3 independent, sourced public complaints (URLs required), or a defect reproduced in a validation run. The collection method is documented in [validation/protocols/sentiment-refresh-protocol.md](validation/protocols/sentiment-refresh-protocol.md).
2. **Encode in three places**: the DIVERGE lane's attractor list in `SKILL.md`, the Banned list (with an INSTEAD that points back into the seeded deck, never at a specific alternative look, and a [fingerprint] tag), and a greppable string or yes/no assertion in `references/checklist.md`. Pure quality rules (contrast, targets, states) take a [craft] tag instead and enter the craft floor or the sweep without touching the attractor list.
3. **Deck check**: grep the reference decks for rows embodying the pattern. A row where the pattern is the stated concept is a legal exception; anything else needs fixing in the same change.
4. **Record**: add the evidence with source URLs to a dated file in `validation/`.

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

`audit.mjs`, `codex-audit-loop.sh`, and `genimage.sh` must stay dependency-light, degrade gracefully (clear message + documented exit code), and remain host-neutral. Test against the defect corpus in `validation/` before and after: the audit must still catch the known collisions and reveal bugs, and still pass the known-clean runs.

## Validation bar for any substantive change

This section is for maintainers changing the skill, not people using it for a design. A normal design run needs one capable host and receives no penalty, lower score, or `DEGRADED` note for lacking another. Cross-host work enters a user task only when its prompt explicitly requests comparison, replication, or compatibility testing.

Run the standard maintainer proof from [validation/runs/kilnhouse-2026-07/README.md](validation/runs/kilnhouse-2026-07/README.md): at least one baseline (expect tells), skill runs on both hosts (expect clean gates), two same-brief DIVERGE runs (expect zero shared ledger axes), screenshots or an honest DEGRADED. Add the artifacts and a dated summary to `validation/`. Changes that touch the README's core claim (output not identifiable as AI-made) additionally follow [validation/protocols/external-validation-protocol.md](validation/protocols/external-validation-protocol.md): author-run proofs move the machinery, only the external studies move the claim.

## Style

- No em dashes, no en dashes, no emojis, anywhere in this repository.
- Every rule you write must resolve to a number, a hex, a greppable string, or a yes/no test. If a literal-execution model cannot verify it mechanically, it is not a rule yet.
