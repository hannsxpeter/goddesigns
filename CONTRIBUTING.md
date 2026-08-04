# Contributing

Contributions are welcome. There is one rule behind all the others: **every
load-bearing claim has receipts.**

That is not bureaucracy. goddesign exists because AI design advice is full of
confident opinions that nobody checked, and the moment this repository starts
accepting rules because they sound right, it becomes the thing it was built to
replace. So a good idea with no evidence gets recorded as a good idea, not
merged as a rule.

## Where to start

| You want to | Go to |
|---|---|
| Report a bad output, a false positive, or a bug | Open an issue with the page or the offending file attached |
| Propose a new banned pattern ("AI sites always do X") | [Proposing a new tell](#proposing-a-new-tell) |
| Add a new visual direction to the deck | [Adding a direction row](#adding-a-direction-row) |
| Contribute a direction extracted from a real human-built site | [Contributing a human-genome row](#contributing-a-human-genome-row) |
| Change one of the scripts | [Changing scripts](#changing-scripts) |

You do not need to be a designer to contribute. The human-genome lane in
particular is open to anyone who can point at a website they admire and write
down what it actually does.

## Proposing a new tell

A tell is a pattern that makes a page recognizable as AI-made. Adding one takes
evidence, not taste.

1. **Bring evidence.** At least 3 independent, sourced public complaints (URLs
   required), or a defect you reproduced in a validation run. The collection
   method is documented in
   [validation/protocols/sentiment-refresh-protocol.md](validation/protocols/sentiment-refresh-protocol.md).
2. **Encode it in three places.** The DIVERGE lane's attractor list in
   `SKILL.md`, the Banned list (with an INSTEAD that points back into the seeded
   deck, never at one specific alternative look, plus a `[fingerprint]` tag), and
   a greppable string or yes/no assertion in `references/checklist.md`. Pure
   quality rules (contrast, tap targets, states) take a `[craft]` tag instead and
   enter the craft floor or the gate without touching the attractor list.
3. **Mechanize it if a script can see it.** If the pattern resolves to a string,
   a number, or a count in source, it becomes a rule in
   `skills/goddesign/scripts/sweep.mjs` and a row in the Phase 2a table in
   `references/checklist.md`. Those two files are one contract, and
   `scripts/lint-decks.mjs` fails when they drift, so add the rule id and its
   severity to both in the same change.
   - Choose `advisory` when the pattern has a legal case the script cannot read
     (a deck row that states the face, a grammar break declared in the lock).
   - Choose `fail` only when no lock line could ever make it correct.
4. **Calibrate against the corpus.** Run the new rule across `validation/runs/`
   and `validation/experiments/` and report the split in your pull request. A
   rule that fires on the clean corpus is a false positive, not a stricter gate,
   and gets narrowed rather than merged with a note. This is not optional: a
   scanner that cries wolf gets ignored, and then the gate is worse than no gate.
5. **Check the deck.** Grep the reference decks for rows that embody the pattern.
   A row where the pattern is the stated concept is a legal exception; anything
   else needs fixing in the same change.
6. **Record it.** Add the evidence, with source URLs, to a dated file in
   `validation/`.

Worth knowing before you start: some patterns genuinely cannot be mechanized,
and finding that out is a real result. An attempt to automate the last five
Banned-list clauses produced zero new rules and is published as a refusal in
[validation/research/banned-list-mechanization-2026-08.md](validation/research/banned-list-mechanization-2026-08.md).

## Adding a direction row

A direction row is a complete visual package, not a mood. Every field is a
value: colors as hex, fonts with a working import line, radius, shadows,
background treatment, one signature element, motion numbers. **No field may be
left as an adjective.** "Warm neutral" is not a color.

Then check it against the deck-wide distribution caps, which exist because a
deck that repeats itself is just a slower kind of convergence:

- **Accent spread.** No more than 2 rows per 30-degree accent hue band. No two
  rows may share both a paper band and an accent hue band unless their
  saturation classes differ sharply (a candy pink and a deep oxblood are not
  confusable; two saturated red-oranges are).
- **Type spread.** No two rows share a display font family or superfamily.
- **Depth spread.** Each shadow and depth treatment belongs to exactly one row.
  Hard offset shadows: row 14 only. Sticker outline: row 10. Soft layered
  tinted: at most one dark row and one light row. Tilt as a stated device: one
  row (Lo-Fi Riso misregistration). The hard-offset-plus-tilt-plus-chips kit is
  Claude's native default and reads as "an AI design variant" the moment two
  rows carry it; the owner caught this across three separate rounds, and the
  deck was rebalanced on 2026-07-18 because of it.
- Verify every Google Fonts import URL answers 200.
- Check the row against the entire Banned list. A banned pattern may appear only
  as the row's stated concept.
- Update every seed modulus if the deck size changes (`SKILL.md` Step 3b and its
  no-shell fallback). The moduli must always match deck sizes, or the skill rolls
  for a row that does not exist.

## Contributing a human-genome row

This is the most valuable contribution an outsider can make, and it does not
require design skill.

**Why it exists:** a model cannot author its way out of its own distribution.
Every direction Claude writes, however varied, is still drawn from the thing we
are trying to escape. So rows 16 and up are not authored. They are extracted
from real, human-built, shipped websites. The long-term goal is for human
genomes to outnumber authored rows.

Anyone can extract a genome from a site they admire and propose it. Here is the
recipe:

1. **Pick the site.** It must be human-built and actually shipped. A design
   gallery mockup is not a genome. Choose from a stated sourcing vantage in
   `skills/goddesign/references/genome-sources.md`.
2. **Capture evidence.** Full-page screenshots at 375, 768, and 1280, plus the
   computed styles of five elements: body text, the h1, one label or kicker, one
   button, the footer. This is your receipt that the values came from the site
   rather than from memory.
3. **Extract the genome**, every field as values, never adjectives:
   - **Type system.** Families and weights in use, the measured size ratio
     between display and body, and whether one family does everything.
     Single-family systems are the most common human pattern and the rarest AI
     one, so record them when you find them.
   - **Palette relationships.** The exact neutrals and their chroma, where the
     accent actually appears, and above all **where the site breaks polite
     defaults**: accent on body text, a band ignoring 60-30-10, two hues that
     should clash and do not. The breaks are the signal. The polite parts are
     already in the model.
   - **Grammar habits.** How sections open, the padding rhythm (measure three
     sections), how many container widths exist, what is left misaligned on
     purpose.
   - **Density rhythm.** Measure the shortest and longest sections. Human pages
     are uneven.
   - **Signature devices.** The one element only this site has.
   - **Imperfections.** Keep them. They are load-bearing, and the row must say
     where they live.
4. **Encode it as a complete row** meeting the direction-row bar above, with a
   "do not polish the human traits away" note at every point where the genome
   contradicts model instincts.
5. **Check the caps.** Accent and depth caps like any row, plus the sourcing caps
   below. Verify the import URL answers 200. Update the seed moduli if the deck
   grew.

**Sourcing provenance.** Left to instinct, a maintainer keeps sampling the same
admired corner of the web, and the sourced rows re-converge, which defeats the
entire point of this lane. So every genome row added from v1.3.0 on carries a
machine-readable provenance line:

```
Genome: vantage=<0-9> | source=<domain> | captured=<YYYY-MM>
```

Caps, grep-checkable against `references/directions.md` and enforced in review:
at most two genome rows share a `vantage=` value, and the two most recently
added genome rows must not share one. `source=` is the real site's domain, as
evidence of a human-built origin. Row 16 predates the schema and is grandfathered
as `source=unrecorded-preschema`. This is deck maintenance only, so it changes
nothing in a design run and both hosts stay identical.

## Changing scripts

`audit.mjs`, `sweep.mjs`, `extract-tokens.mjs`, `codex-audit-loop.sh`,
`genimage.sh`, and `verify-map.mjs` must stay dependency-light, degrade
gracefully (a clear message plus a documented exit code), and remain
host-neutral.

Test against the defect corpus in `validation/` before and after your change:
the audit must still catch the known collisions and reveal bugs, the sweep must
still separate the skill runs from the baselines, and both must still pass the
known-clean runs.

`sweep.mjs` carries three extra rules of its own:

- **Comments are not code.** The script blanks them before every scan, so a lock
  block quoting a banned hex is not a finding.
- **Waivers are read before blanking, and require a stated reason.** A reasonless
  waiver is itself a failure.
- **Every new or changed rule reports its corpus split in the pull request**: how
  many goddesign artifacts it fires on, and how many baselines.

## Changing the design map contract

`references/map.md` documents the `.design-map.md` shape and
`scripts/verify-map.mjs` enforces it. They are one contract in two files, so
change both in the same commit. `scripts/lint-decks.mjs` reads the validator's
`ORDER` array and fails if the deck stops documenting a required section. A new
section means a new heading in the deck's template, a new entry in `ORDER`, and
its own check in the validator.

The map is structural machinery, so it takes no `[fingerprint]` or `[craft]` tag
and needs no tell evidence. It still needs the same mechanical bar as every other
rule here: a number, a greppable string, or a yes/no test.

## Validation bar for substantive changes

This section is for maintainers changing the skill, not for people using it to
design something. A normal design run needs one capable assistant and receives no
penalty, lower score, or `DEGRADED` note for lacking a second one. Cross-host work
enters a user's task only when the prompt explicitly asks for comparison,
replication, or compatibility testing.

Run the standard maintainer proof from
[the Kilnhouse run](validation/runs/kilnhouse-2026-07/README.md): at least one
baseline (expect tells), skill runs on both hosts (expect clean gates), two
same-brief DIVERGE runs (expect zero shared ledger axes), and screenshots or an
honest DEGRADED. Add the artifacts and a dated summary to `validation/`.

Changes that touch the README's core claim (that the output is not identifiable
as AI-made) additionally follow
[the external validation protocol](validation/protocols/external-validation-protocol.md).
The distinction is strict and worth internalizing: **author-run proofs move the
machinery, only external studies move the claim.**

## Style

- No em dashes, no en dashes, no emojis, anywhere in this repository.
- Every rule you write must resolve to a number, a hex, a greppable string, or a
  yes/no test. If a model that executes literally cannot verify it without
  taste, it is not a rule yet. Write it down as a candidate instead.
