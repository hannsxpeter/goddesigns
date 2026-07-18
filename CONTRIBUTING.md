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
- Verify the Google Fonts import URL answers 200.
- Check the row against the entire Banned list; a banned pattern may appear only as the row's stated concept.
- Update every seed modulus if a deck's size changes (`SKILL.md` Step 3b and its no-shell fallback): the moduli must always match deck sizes.

## Changing scripts

`audit.mjs`, `codex-audit-loop.sh`, and `genimage.sh` must stay dependency-light, degrade gracefully (clear message + documented exit code), and remain host-neutral. Test against the defect corpus in `validation/` before and after: the audit must still catch the known collisions and reveal bugs, and still pass the known-clean runs.

## Validation bar for any substantive change

Run the standard proof from [validation/archive/2026-07-kilnhouse/kilnhouse-2026-07.md](validation/archive/2026-07-kilnhouse/kilnhouse-2026-07.md): at least one baseline (expect tells), skill runs on both hosts (expect clean gates), two same-brief DIVERGE runs (expect zero shared ledger axes), screenshots or an honest DEGRADED. Add the artifacts and a dated summary to `validation/`.

## Style

- No em dashes, no en dashes, no emojis, anywhere in this repository.
- Every rule you write must resolve to a number, a hex, a greppable string, or a yes/no test. If a literal-execution model cannot verify it mechanically, it is not a rule yet.
