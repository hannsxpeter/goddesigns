# goddesign

**Stop shipping websites that look like every other AI-built website.**

[![Release](https://img.shields.io/github/v/release/hannsxpeter/goddesigns)](https://github.com/hannsxpeter/goddesigns/releases)
[![License: MIT](https://img.shields.io/github/license/hannsxpeter/goddesigns)](LICENSE)
[![Hosts](https://img.shields.io/badge/hosts-agnostic-blue)](docs/INSTALL.md)
[![Gate](https://img.shields.io/badge/gate-29%20automated%20checks-blue)](skills/goddesign/references/checklist.md)
[![Validation](https://img.shields.io/badge/validation-7%2F7%20runs%20green-success)](validation/runs/kilnhouse-2026-07/README.md)
[![Evidence](https://img.shields.io/badge/evidence-346%20sourced%20comments-informational)](validation/research/sentiment-evidence-2026-07.md)

goddesign is a free, open-source add-on for AI coding assistants. Install it
once, and every web page your assistant builds comes out looking like a real
design studio made it: a distinct visual identity, professional craft, and an
automated quality check before it ever reaches you.

It works with Claude Code and OpenAI Codex CLI today, and with any assistant
that can read a plain markdown skill file.

![Seven runs of the same brief producing seven completely different designs: Terminal Core, Swiss International, Luxury Serif, Machine Room, Editorial Magazine, Art Deco Geometric, and a chartreuse signup flow](docs/assets/seven-directions.png)

<sup>Real screenshots from the [Kilnhouse validation run](validation/runs/kilnhouse-2026-07/README.md). Same prompt every time.</sup>

---

## The problem

You ask an AI to build you a landing page. It looks fine. It also looks exactly
like the last four landing pages you have seen: the purple gradient headline,
the cream background with the serif type and the terracotta button, the same
card grid, the same fade-in as you scroll.

People notice. That is the finding behind this project: we collected and
verified 346 public comments about AI-designed websites, and the single loudest
complaint is that these pages are **recognizable on sight**. A design that
announces "a robot made this" undercuts the thing it was supposed to sell.

There are two ways it goes wrong, and they are opposites:

| Failure | What it looks like | Which assistants do it |
|---|---|---|
| **Convergence** | Tasteful, polished, and identical every time. The same fonts, the same palette, the same hero section. | Models with strong design instincts |
| **Literalness** | Nothing invented at all. Browser default buttons, one recycled template, "use gray" left as an unanswered decision. | Models that follow instructions but do not improvise |

Telling an AI "don't make it look AI-generated" does not fix either one. Ban the
purple gradient and it moves to the next most popular look. Variety has to be
built in, not asked for.

## What goddesign does about it

**It rolls the dice, then holds itself to the result.** Before any code is
written, the skill picks a complete visual direction from a curated deck: 17
aesthetic directions, 12 page structures, 10 color palettes, 12 typeface
pairings. The pick is seeded, so it is genuinely different each time, and a
running log makes sure your next project does not repeat your last one. A layer
of controlled randomness nudges the exact colors, so two projects that draw the
same card still ship different pages.

**It writes the design down before it builds.** Every decision (exact colors,
fonts, spacing, motion, the one signature element) is committed to a plain-text
plan first. Then the code has to match the plan. No drifting halfway through
into the house style.

**It checks its own work, mechanically.** When the page is built, two automated
checks run before you see it:

- A **source scan** reads the code for 29 known problems: banned fonts and
  colors, gradient text, buggy scroll animations that leave the page blank,
  missing keyboard focus outlines, missing reduced-motion support, marketing
  buzzword filler.
- A **visual audit** actually opens the page in a browser at phone, tablet, and
  desktop sizes, and takes screenshots. It catches overlapping text, content
  that never appears, horizontal scrollbars, buttons too small to tap, and
  fonts that silently failed to load.

Anything that fails goes back for a bounded round of fixes, with the original
design plan frozen so the assistant cannot "fix" a problem by quietly
redesigning the page.

**It handles projects bigger than one sitting.** If your brief covers three or
more screens (marketing site, sign-up, dashboard, settings), goddesign first
charts a shared design map: one direction locked once, inherited by every screen,
worked through one screen at a time so they end up looking like one product
instead of five unrelated ones.

## Who it is for

- **Founders and solo builders** shipping a site with an AI assistant who do not
  want it to look like a template.
- **Product and marketing teams** who need a landing page or dashboard that
  passes as professionally designed, without a design hire.
- **Developers** who can build anything but would rather not make 40 color and
  typography decisions per page.
- **Designers** working with AI who want their existing design system extended
  faithfully instead of reinvented.

You do not need to be a designer to use it. You do need an AI coding assistant.

## Get started

```sh
git clone https://github.com/hannsxpeter/goddesigns.git
ln -s "$PWD/goddesigns/skills/goddesign" ~/.claude/skills/goddesign   # Claude Code
ln -s "$PWD/goddesigns/skills/goddesign" ~/.agents/skills/goddesign   # Codex CLI
```

Then just ask for what you want:

```
/goddesign a landing page for a small-batch coffee roaster
```

In Codex the command is `$goddesign`. You can also skip the command entirely:
the skill recognizes design requests on its own ("build me a signup page", "make
this dashboard look better"), and a one-paragraph note in your assistant's
instructions file makes that automatic every time.

Step-by-step setup, optional extras, and notes for other assistants:
[docs/INSTALL.md](docs/INSTALL.md).

## Does it actually work?

We publish the evidence, including the parts that are not finished.

**What has been proven.** Seven runs of the same brief produced seven completely
different, quality-checked designs: a terminal-inspired letter, a Swiss
manifesto, a luxury serif, a dense machine-room dashboard, an editorial print
layout, an art deco dashboard, and a chartreuse signup page. Two runs without
the skill reproduced the exact failures we catalogued, and both rendered as
completely blank pages in screenshots because of a scroll-animation bug the
automated audit caught and human review had missed. Full write-up with
screenshots: [the Kilnhouse run](validation/runs/kilnhouse-2026-07/README.md).

![Three full-page captures side by side. The two unskilled baseline pages are blank below the hero; the goddesign page renders completely](docs/assets/audit-catches.png)

<sup>That blankness is the actual defect, not a capture error. The page looks
fine while you scroll it and renders empty to anything that does not: a
screenshot tool, a printer, a search crawler, a reader with JavaScript
disabled.</sup>

**The automated scan separates the two populations cleanly.** Run back over
every page we have on file, it clears 14 of 19 goddesign pages with zero
failures, and fails all 18 pages built without it, at 6 to 70 problems each.

**What has not been proven yet.** All of the above is author-run testing. It
shows the machinery produces variety and catches defects. It does not yet show
that outside judges agree, and we are careful about that distinction. A
pre-registered independent study is underway: 20+ outside raters, blind
identification, results to be published either way. Generation is complete and
the corpus is frozen; the rater responses are not in. Until they are, we do not
claim external validation. The protocol and the current state are public in
[validation/protocols/external-validation-protocol.md](validation/protocols/external-validation-protocol.md)
and the [Study A completion audit](validation/studies/study-a-2026-07/completion-audit.md).

**We retract things.** One test capture was withdrawn in July 2026 after it
turned out to be contaminated, and the finding plus every claim it touched is
recorded in public: [the withdrawal
record](validation/runs/kilnhouse-2026-07/WITHDRAWN-codex-baseline-kilnhouse.md).

Every rule in this skill traces to one of two sources: the 346-comment study of
what people actually mock about AI design, or a defect caught in a real test run.
Nothing is here because it sounded like good advice.

## Common questions

**Do I need to install anything besides the skill?**
No. Everything core runs with no extra dependencies. The visual audit uses a
headless browser if one is available; without it, the skill tells you plainly
that it skipped that check rather than pretending it passed.

**Will it override my company's existing design system?**
No. If your project already has a design system, goddesign switches into
extension mode: it reads your existing colors, fonts, and spacing, and builds
within them instead of inventing a new look.

**Does it send my code anywhere?**
No. The automated checks run locally. No network, no accounts, no external
service is required for a design run.

**Can it make images and illustrations?**
Yes, when a page genuinely needs them, though most designs deliberately ship
none. Image generation goes through Codex and ChatGPT: assistants without their
own image tool hand the art direction to the Codex CLI, which generates it with
ChatGPT's built-in image tool. If that is not available, the page falls back to
the hand-coded artwork the chosen direction already specifies.

**Will every page look wild?**
No. Each page takes exactly one deliberate risk and keeps the rest disciplined.
"Distinct" is the goal, not "loud".

**Is it locked to one AI vendor?**
No. It is a plain markdown file with a couple of small scripts. Any assistant
that reads markdown skills can run it, and no part of the core work depends on a
particular editor, model vendor, or hosting platform.

## A quick glossary

Terms you will see in the output and in the deeper docs:

- **Direction lock**: the written design plan, decided before any code, that the
  finished page is graded against.
- **The deck**: the curated set of directions, layouts, palettes, and font
  pairings the skill picks from.
- **Seed**: the number that drives the pick, so results vary run to run instead
  of converging.
- **The sweep**: the automated scan of the code for known problems.
- **The audit**: the automated check of the rendered page in a real browser.
- **The gate**: the two of them together, plus a scored self-critique. A page
  either clears it or gets fixed.
- **Design map**: the shared plan for a project with three or more screens.

## What is in this repository

| Path | What it is |
|---|---|
| `skills/goddesign/SKILL.md` | The skill itself: the instructions your assistant follows |
| `skills/goddesign/references/` | The decks: 17 directions, 12 layouts, 10 palettes, 12 font pairings, motion, imagery, the design map, the quality checklist |
| `skills/goddesign/scripts/` | The automated checks: source scan, visual audit, design-map validator, install verifier, token extraction, and helpers |
| [`validation/`](validation/README.md) | The evidence library: research, test protocols, experiments, comparison runs, and studies |
| `docs/` | Setup guide and the technical architecture |

## Documentation

- [Setup guide](docs/INSTALL.md): installation, requirements, per-assistant notes
- [Architecture](docs/ARCHITECTURE.md): how and why each mechanism works, in detail
- [Contributing](CONTRIBUTING.md): the evidence bar for new rules, how to add deck rows
- [Changelog](CHANGELOG.md): release history

## License

[MIT](LICENSE). Free to use, free to modify, free to ship commercially.
