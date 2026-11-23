# Architecture

Goddesign is one skill and the scripts beside it. The model designs. The
scripts deal, remember, and measure.

## Draw

`skills/goddesign/scripts/pick.mjs` rolls a seed, reads the deck in
`references/`, and applies two ledgers: one for this machine, one for this
run. It will not repeat a recent structure, and it will not deal a third paper
or accent in a row. It then nudges the colors so two runs that draw the same
row still differ. The printout is the direction, the page structure, the
tokens, and a lock with three lines left for the model to fill.

A model asked to "pick at random" picks the same favorite. The script is the
part that actually picks.

## Lock, then build

The lock is plain text, written before code: exact colors, fonts, the
signature, and the four grammar breaks. The page is graded against that text.
An edit to an existing page skips the draw and the lock. It keeps the current
tokens and runs the source scan on the files that changed.

If the project already has tokens, `extract-tokens.mjs` reads them and the run
builds inside that system instead of dealing a new card.

A brief with three or more surfaces gets `references/map.md` first, so later
sessions share one system. `verify-map.mjs` checks the map's shape.

## The gate

`sweep.mjs` reads source. It knows HTML, CSS, React, Vue, Svelte, Astro, and
the UI macros in Leptos (`view!`), Yew (`html!`), and Dioxus (`rsx!`). It
skips `target/` and a Rust file with no UI macro. Findings point at the real
line.

`audit.mjs` renders the page at 375, 768, and 1280 and reports overflow,
collisions, hidden text, small targets, and fonts that fell back. If no
renderer is available it says so. A skipped audit is not a pass.

A failure is fixed with the lock frozen. The run does not get to redesign its
way out of a finding.

## What a run reads

A new page on a frontier model reads `SKILL.md` and the dealer's printout.
Literal and smaller models also read `references/full-lane.md` and the
checklist. Motion and copy notes are read only when the page needs them.
