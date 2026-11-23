# Contributing

Issues and pull requests are welcome. A new rule needs a check that fails
before the change and passes after it. A preference with no failing case stays
a note.

## Checks

```bash
npm test
```

That runs the dealer tests, the source-scan tests, the installer tests, the
deck lint, and the install-integrity check. Node 18 or newer.

## Deck rows

Directions live in `skills/goddesign/references/directions.md`, structures in
`layouts.md`, palettes in `palettes.md`, type in `fonts.md`. `scripts/lint-decks.mjs`
checks that the counts match the seed moduli in `SKILL.md`. Add a row in the
same shape as its neighbors, then update the modulus and the install check
together.

Accent hues are capped at two rows per 30-degree band. One band already holds
three rows; that debt is named in the linter. Do not add a fourth.

## Source scan

A new finding belongs in `skills/goddesign/scripts/sweep.mjs` with a fixture in
`scripts/sweep.test.mjs`: one file that should report it, and decoys that
should not. The calibration set in `test/corpus/` is real pages. A skill-run
page that suddenly reports more than two failures is a false positive until
you show otherwise.

## Prose

No em dashes or en dashes in markdown. The deck lint checks.
