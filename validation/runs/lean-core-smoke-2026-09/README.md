# Lean-core smoke run, 2026-09-26

One brief designed twice before v2.0.0 was tagged: once under the new lean core, once under v1.8.0. It exists to close the gap v1.6.2 left open (a release whose changes no page had been designed under), and it found one real regression, fixed before the tag.

It is **one pair, not the comparison**. Both runs used the same model through fresh-context subagents of a Claude Code session, because the `claude` CLI was not yet logged in for headless runs. The pre-registered four-arm test in `validation/studies/lean-core-2026-09/` is the measurement; this is the smoke check that the machinery works end to end.

## Method

- **Brief**: Study A's B01, Northstar Signal (privacy-first analytics for small software teams), the same text as the four-arm study's L01, with the study's scope sentence (single file, no subagents, no em or en dashes, no emojis).
- **Arms**: a snapshot of the v2.0.0 working tree, and `git archive v1.8.0`. Each subagent was told to read its copy's `SKILL.md`, follow it, use no other installed skill, and keep both run ledgers inside its workspace.
- **Isolation**: separate workspaces; the home ledger untouched (the v2 arm via `GODDESIGN_USER_LEDGER`, the v1.8.0 arm by an instructed path substitution).
- **Measurement**: the harness's subagent token total, tool-call count, and wall time; then both pages re-measured by the maintainer with the repository's own `sweep.mjs` and `audit.mjs`, independent of what each run reported.

## Results

| | v2.0.0 lean core | v1.8.0 full skill |
|---|---|---|
| Seed, direction, structure | 1611509905, 5 Organic Modern, 7 Specimen | 1156767489, 7 Editorial Magazine, 6 Letter |
| Wall time | 32.8 min | 37.0 min |
| Tool calls | 84 | 64 |
| Subagent tokens | 319,474 | 388,883 |
| Gate, as reported | sweep 0 after clearing 25 inline styles; audit 0 after 1 fix cycle | sweep 0; audit 0 after fixing 3 findings; Phase 1 scores; Phase 2b 60 of 60 hand-checked; `DEGRADED: no blind read` (the brief forbade subagents) |
| Gate, re-measured | sweep exit 0; audit exit 0, no finding at 375, 768, or 1280 | sweep exit 0; audit exit 0, no finding at 375, 768, or 1280 |
| Signature | a full-bleed green specimen grid of the nine fields stored for one pageview | one visit's stored record set as a pull quote across the margin column, with a drop cap |
| Product artifact | a working sample dashboard in the hero, 7-day and 30-day toggle recomputing every figure | a sample Monday report enclosed in the letter |

The v2 run read 16 KB of instructions where v1.8.0 read 95 KB, yet its total tokens were only 18% lower (69,409 fewer) and it finished 4.2 minutes sooner. On a full run, building and verifying the page dominates the cost, so the cut to fixed reading moves the total much less than it moves the reading. The four-arm study measures this across twenty runs; one pair cannot.

## What it found

1. **A regression in the lean core, fixed before the tag.** The v2 page stated prices and terms the brief never supplied (tiers from $9 to $99, a 30-day no-card trial, Frankfurt hosting, one-business-day support) without labeling them as placeholders on the page; the run's report listed them for confirmation, but a visitor could not tell. The v1.8.0 page labeled its equivalents, because its checklist says demo builds mark the trust surface as sample. The rule had been compressed out of the core. `SKILL.md` now says to label prices and terms the brief did not supply as placeholders, the lock check asks for it, and `lint-decks.mjs` pins the sentence (the check fails against v1.8.0's text, so it is not vacuous).
2. **Both arms converged on the same content.** Different seeds gave different forms, but the same model reached for the same concept in both: a record of one stored pageview as the signature, a visitor hash whose salt is deleted at midnight, pricing from $9 a month, and a Monday report. The variance engine varies form; it does not vary what the model believes the subject is. This matches the owner's standing complaint that runs still read as one author at the level of content. Not a v2 regression; recorded as the next frontier.
3. **The v1.8.0 run spent its gate on self-grading.** It scored seven axes (one it called vacuous, since both ledgers were empty) and hand-checked sixty assertions, where the v2 run's gate was the two scripts, a look at the captures, and a short lock check. Both reached the same measured result.
4. **One weakness in the v2 page**: its five feature rows share one two-column layout, a mild case of the uniform band stack the grammar breaks exist to prevent. The declared breaks shipped elsewhere on the page, but this section alone reads as a template.

## Snapshot note

The v2 arm ran a snapshot taken before two later `SKILL.md` edits: a sentence routing unrunnable scripts to the checklist's fallbacks, and the placeholder fix above. The tagged v2.0.0 includes both; the four-arm study runs the tag.

## Files

| File | What it is |
|---|---|
| `v2-northstar.html` | The v2 page, a single file |
| `v2-northstar-1280.webp`, `v2-northstar-375.webp` | Full-page captures from the maintainer's re-run of `audit.mjs`, WebP at quality 70 |
| `v2-audit.json`, `v2-design-log.json` | The re-measured audit, and the ledger entry `pick.mjs --log` wrote |
| `v1.8.0-northstar/` | The v1.8.0 page and its stylesheet |
| `v1.8.0-northstar-1280.webp`, `v1.8.0-northstar-375.webp` | Its captures, same method |
| `v1.8.0-audit.json`, `v1.8.0-design-log.json` | Its re-measured audit and ledger entry |

## Honesty

Northstar Signal is not a real company. Every figure on both pages is illustrative sample data, and the v2 page's prices and terms were invented by the run, which is the defect recorded above.
