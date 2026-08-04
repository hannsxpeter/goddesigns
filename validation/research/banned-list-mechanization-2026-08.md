# Mechanizing the rest of the Banned list: a measured refusal, 2026-08-04

After v1.6.2 closed Banned bullet 1, five clauses were left that resolve to strings or counts and had no sweep rule: bullet 4 (cream plus terracotta plus display-serif; near-black plus acid green), bullet 12 (marker underlines and squiggles), bullet 13 (glassmorphism, sparklines, fake chrome, emoji as icons, mixed icon sets), bullet 17 (an accent-colored span inside a headline), and the remainder of bullet 3 (cyan-magenta washes, purple-tinted drop shadows).

This is the record of trying to mechanize all of them and concluding that **none of them can be a source rule**. Zero of five survived. That is the finding, and it is not a shrug: every failure has a specific, reproducible cause, and four of the five fail for the same reason.

## Method

Seven agents. Six took one clause each and were required to build the detection in a scratch copy of `sweep.mjs` and **run** it across both corpus populations rather than reason about what it would match; one audited the whole Banned list against the whole rule set and the whole checklist. Every candidate that reached a clean split was then handed to an adversarial agent instructed to break it with legal, deck-faithful code.

Corpus: 25 goddesign artifacts, 18 comparison artifacts, 1 `WITHDRAWN-` (counted in neither population). 14 detection vectors were built and measured. 43 clauses across 17 bullets were classified.

## The result

**Zero rules shipped.** Five reached a clean corpus split and all five were then broken on legal code.

| Candidate | Split reached | Killed by |
|---|---|---|
| `glass-panel` | 0/25 clean, 2/18 comparison | Nine false positives; its exemptions test the device's spelling, not the device |
| `accent-headline` | 0/25 clean, 11/18 comparison | Row 3 Terminal Core's stated Signature is a prompt-prefixed heading |
| `cream-terracotta-serif` | 0/25 clean, 5/18 comparison | All four cream-ground serif rows fire once the build carries the destructive colour the checklist mandates |
| `marker-underline` | 0/25 clean, 7/18 comparison | Flags faithful executions of row 15's stated torn-paper divider |
| `purple-shadow` | 0/25 clean, 1/18 comparison | Collides with the skill's own mandated jitter |

Two more were declined before reaching an adversary, on measurement rather than argument. **Emoji as icons**: zero emoji-presentation code points in all 25 goddesign artifacts, all 18 comparison artifacts, and all 10 study-a runs. There is no defect to reproduce and nothing to separate, so `CONTRIBUTING.md`'s evidence bar is simply unmet. **Cyan-magenta washes**: fires on nothing in either population, so there is no split and no evidence the threshold is anywhere near right.

## Why they fail, which is the actual finding

Four of the five die on the same collision: **the deck states the pattern.**

The Banned list is written with an escape in almost every bullet, and those escapes are load-bearing rather than decorative. "Only when the seed or brief selects them deliberately." "Flourishes only as a direction's stated signature." "Metallics only in the Art Deco row." A source scanner cannot read the DIRECTION LOCK, so it cannot tell a banned pattern from a locked row executing its own stated signature. Concretely:

- Row 3 Terminal Core states `Signature: prompt-prefixed headings ("$ deploy")`. An accent-colored span inside an `h1` **is** that signature.
- Row 15 states a torn-paper divider; `marker-underline` flags it.
- Rows 5, 6, 7 and 15 are cream-ground serif rows whose stated accents are sage, riso blue, oxblood and sage. `cream-terracotta-serif` reports "the cream plus terracotta reflex" on them the moment the build adds the destructive and error colours that `checklist.md`'s States group requires.

The fifth failure is sharper and worth stating on its own, because it is the skill colliding with itself rather than with its deck. `purple-shadow` banned OKLCH hue 272-330. Direction row 12's accent `#2B4BFF` sits at hue **267.1**, and Step 3d **mandates** rotating the accent by `jitterh` in the range -12 to +12. Eight of the twenty-five equally likely rolls land it at 272.1 to 279.2, inside the banned band, at chroma 0.264. A rule banning purple shadows would fire on a page whose accent the skill itself rotated into purple, and `checklist.md` gates on that rotation being present. The rule cannot be narrowed out of this: the collision is with a mechanism the skill requires.

## What the corpus said about the obvious vectors

Ten of the fourteen vectors were disqualified by measurement before any adversary saw them, because they fire on the clean corpus. `CONTRIBUTING.md` is unambiguous that this makes them false positives to fix or drop, never to merge with a note.

| Vector | Clean corpus | Comparison | Note |
|---|---|---|---|
| contents-rail | 11/25 | 16/18 | |
| mono-microlabel | 5/25 | 8/18 | |
| bounce-easing | 4/25 | 1/18 | **fires more on clean**; rows 2 and 10 state that curve |
| icons-on-non-interactive | 3/25 | 12/18 | |
| glassmorphism-naive | 2/25 | 17/18 | measures "has a sticky header", not glassmorphism |
| sparkline | 1/25 | 3/18 | |
| accent-span-in-headline | 1/25 | 0/18 | **fires only on clean** |

The glassmorphism number deserves its own line because it inverts the intuition. Of the 22 `backdrop-filter` rules across both populations, **19 are a frosted nav or header bar**, a device the skill runs use as readily as the baselines. The naive rule scores 2/25 against 17/18 and looks like an excellent separator; it is actually detecting sticky headers. Strip the bars and the comparison side collapses from 17 to 2. Real glassmorphism is nearly absent: two instances in 43 files, both in codex baselines.

## What shipped instead

The clauses are not left unaddressed. They move to the tier that can actually decide them, with a named home, which is the honest close rather than a weak rule.

- **13 new Phase 2b assertions** in `references/checklist.md`, across Color, Layout, Motion, and Honesty. Phase 2b is read with the lock in hand, which is exactly the context a source scanner lacks and exactly what these clauses need.
- **One correction to an over-claim.** The Layout line marked three clauses `[sweep]` when the sweep covers two of them; contents rails and chapter headers have no rule and never did. It is now two lines, and the uncovered half says so.
- **Two boundaries recorded as render-tier on purpose**: "cards inside the hero" resolves against the first viewport, which only `audit.mjs` can compute; "icons on non-interactive elements" and "decorative abstract blobs" resolve against what a mark reads as, which the 3/25 and 1/25 clean-corpus fires prove source cannot see.

## Two defects this audit surfaced in passing

Both are real and both are fixed in the same change.

**1. An `@import` before the first rule silently swallowed that rule.** `rulesOf()` read everything before the first `{` as the selector. A statement at-rule ends in `;` and carries no block, so the text still began with `@`, the parser treated the next rule as an at-rule container, and its declarations were never scanned. The skill mandates an `@import` for webfonts and `:root` first for tokens, so **the shape the skill prescribes was the shape that evaded it**. Measured: `:root { --font-display: Inter, sans-serif }` behind an `@import` swept green; without the `@import`, identical otherwise, it reports `banned-font`. Three files in the repo had a swallowed first rule, including both stylesheets of `validation/runs/bellweather-2026-08/`, whose token block was therefore unchecked when that run was gated. Corpus split for the fix: **zero change across all 49 pre-existing artifacts**, plus a regression test.

This is the same class as the `@theme` bug v1.6.2 fixed, and it is the more serious of the two, because `@theme` affects Tailwind v4 projects while this affected any stylesheet written the way the skill says to write one.

**2. Deck row 16 contradicted its own gate.** Row 16 Trade Counter states `ONE family only: Poppins`, and Poppins is on the Banned list at `fail`. Before the parser fix the contradiction was invisible, because a row-16 build declares its face in a custom property behind an `@import`. With the parser fixed, a faithful row-16 build fails its own deck row. The row is a genome extracted from a real human-built site, so changing the face would falsify the evidence; the row now carries the exact `goddesign-allow` comment to ship, and `SKILL.md`'s bullet 1 names the exception. It is the only deck row that needs a waiver to pass its own gate.

The audit also found the Banned list was narrower than the rule enforcing it: `BANNED_FACE` bans Helvetica, Segoe UI, and Noto Sans, which bullet 1 did not name. The bullet now names them.

## Weight and limitations

Nothing here is a validation run. It is a measurement exercise over an existing corpus of 43 artifacts, and the corpus is the limit: "fires on nothing in either population" is a statement about these 43 files, not about the pattern's rarity in the world. Emoji-as-icons and cyan-magenta washes are declined for want of evidence, not judged impossible, and either becomes admissible the moment a run reproduces the defect.

The adversarial passes were run by agents instructed to refute by default, which biases toward killing candidates. Their kills were spot-checked against the deck: the four deck-collision kills each name a specific row and a specific stated line, and those citations were verified. The jitter collision was verified arithmetically against `SKILL.md` Step 3b's roll.

The parser fix is corpus-neutral by measurement, and its proof is the fixtures rather than the corpus, exactly as with the v1.6.2 pair.

## Kill criterion, recorded in advance

The 13 assertions come out if a run demonstrates that Phase 2b cannot decide them either, which would mean they belong in Phase 3 against a render or nowhere. The parser fix comes out if it changes any finding on the existing corpus, since it is corpus-neutral by construction. The row 16 waiver instruction comes out if the deck ever drops Poppins from that row, which would require re-extracting the genome from the source site rather than editing it in place.

The recorded next action is unchanged: the remaining maintainer-proof arms, a host that cannot run the sweep, and a run that reaches for a system display face.
