# Contributing

goddesign's credibility rests on one rule: every load-bearing claim has receipts. Contributions are welcome when they clear the same bar the existing content had to.

## Proposing a new tell (banned pattern)

A tell is admitted only with evidence, not taste:

1. **Evidence**: at least 3 independent, sourced public complaints (URLs required), or a defect reproduced in a validation run. The collection method is documented in [validation/sentiment-refresh-protocol.md](validation/sentiment-refresh-protocol.md).
2. **Encode in three places**: the DIVERGE lane's attractor list in `SKILL.md`, the Banned list (with an INSTEAD that points back into the seeded deck, never at a specific alternative look), and a greppable string or yes/no assertion in `references/checklist.md`.
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

Rows 16+ are derived from real human-built sites, not authored. To add one: fetch and screenshot the site, extract its genome (type system, palette relationships including where it breaks polite defaults, grammar habits, density rhythm, signature devices, and its imperfections: they are part of the genome), then encode it as a complete row with a provenance line and a "do not polish the human traits away" note where the genome contradicts Claude instincts. Check the new row against the accent-distribution and depth-language caps like any other, and update every seed modulus.

## Changing scripts

`audit.mjs`, `codex-audit-loop.sh`, and `genimage.sh` must stay dependency-light, degrade gracefully (clear message + documented exit code), and remain host-neutral. Test against the defect corpus in `validation/` before and after: the audit must still catch the known collisions and reveal bugs, and still pass the known-clean runs.

## Validation bar for any substantive change

Run the standard proof from [validation/archive/2026-07-kilnhouse/kilnhouse-2026-07.md](validation/archive/2026-07-kilnhouse/kilnhouse-2026-07.md): at least one baseline (expect tells), skill runs on both hosts (expect clean gates), two same-brief DIVERGE runs (expect zero shared ledger axes), screenshots or an honest DEGRADED. Add the artifacts and a dated summary to `validation/`.

## Style

- No em dashes, no en dashes, no emojis, anywhere in this repository.
- Every rule you write must resolve to a number, a hex, a greppable string, or a yes/no test. If a literal-execution model cannot verify it mechanically, it is not a rule yet.
