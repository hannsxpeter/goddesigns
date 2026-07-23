# goddesign

[![Release](https://img.shields.io/github/v/release/hannsxpeter/goddesigns)](https://github.com/hannsxpeter/goddesigns/releases)
[![License: MIT](https://img.shields.io/github/license/hannsxpeter/goddesigns)](LICENSE)
[![Hosts](https://img.shields.io/badge/hosts-agnostic-blue)](docs/INSTALL.md)
[![Validation](https://img.shields.io/badge/validation-7%2F7%20skill%20runs%20green-success)](validation/runs/kilnhouse-2026-07/README.md)
[![Evidence](https://img.shields.io/badge/evidence-346%20sourced%20comments-informational)](validation/research/sentiment-evidence-2026-07.md)

A host-agnostic frontend design skill that produces distinctive,
production-grade UI instead of recognizable AI slop. One skill, two model
lanes: it is proven on Claude Code (`/goddesign`) and OpenAI Codex CLI
(`$goddesign`), and any host that loads minimal markdown skill frontmatter can
run it. One capable host is sufficient for a complete, fully scored design
run. Cross-host work happens only when the prompt asks for comparison,
replication, or compatibility testing, or when a maintainer protocol requires
it.

## Why this exists

Two failure modes produce generic AI interfaces, and they are opposites:

- **Convergence.** Models with strong design taste keep choosing the same tasteful things: the purple gradient hero, the cream-serif-terracotta page, the shadcn card grid. People identify these sites on sight.
- **Literalness.** Models that execute faithfully but invent nothing ship browser defaults: unstyled buttons, one recycled template, "use gray" left as a decision.

goddesign counters both with mechanisms, not advice. Every rule in it traces to one of two sources: a 346-comment verified study of what people actually mock about AI frontend design, or a defect that appeared in a real validation run.

## How it works

1. **Mode check**: existing design systems get faithful extension, not reinvention.
2. **Lane selection**: DIVERGE (taste-heavy models fight their own attractors via forced seeded picks) or EXPAND (literal models get every decision enumerated to a hex, a number, or a named row).
3. **Variance engine**: a seed selects from 17 aesthetic directions, 12 macrostructures, 10 palettes, and 12 type pairings; a run ledger forces rotation between runs; seeded jitter rotates accent hue and nudges paper lightness so two projects landing on the same row never ship identical values.
4. **DIRECTION LOCK**: every visual decision is written down before any code, then executed exactly. Conception can flow through multiple avenues: the seeded deck, human-genome rows extracted from real sites, and comp-first mode (an image model draws a lock-derived mockup, the code model replicates it); one page may mix up to three avenues under one lock.
5. **QA gate**: a seven-axis self-critique (including Credibility, from controlled-study evidence that trust is where AI design measurably lags), a greppable boolean sweep, and a measured audit (`scripts/audit.mjs`) that detects layout collisions, hidden-content reveal bugs, silent font fallbacks, overflow, and undersized touch targets, with a bounded self-correction loop (named failures only, lock frozen, maximum 3 cycles).

## Install

```sh
git clone https://github.com/hannsxpeter/goddesigns.git
ln -s "$PWD/goddesigns/skills/goddesign" ~/.claude/skills/goddesign   # Claude Code
ln -s "$PWD/goddesigns/skills/goddesign" ~/.agents/skills/goddesign   # Codex CLI
```

Then invoke `/goddesign <brief>` in Claude Code or `$goddesign <brief>` in Codex. The command is optional: the skill also auto-triggers on frontend requests ("build me a signup page", "make this dashboard look better") via its description, and a one-paragraph standing instruction in `CLAUDE.md` or `AGENTS.md` makes that a guarantee. Full details, optional dependencies, auto-trigger setup, and host notes: [docs/INSTALL.md](docs/INSTALL.md).

## What is inside

| Path | What it is |
|---|---|
| `skills/goddesign/SKILL.md` | The skill: lanes, variance engine, craft floor, banned list |
| `skills/goddesign/references/` | The decks: 17 directions (including the first human-genome row), 12 layouts, 10 palettes, 12 font pairings, motion recipes, imagery rules, the QA gate |
| `skills/goddesign/scripts/audit.mjs` | Measured visual audit: collisions, reveal bugs, font fallbacks, overflow, touch targets |
| `skills/goddesign/scripts/codex-audit-loop.sh` | Operator wrapper for sandboxed Codex: build inside the sandbox, audit outside, feed failures back into the same session |
| `skills/goddesign/scripts/detect-clis.sh` | Presence-only inventory of known agent CLIs, including distinct Cursor Agent and Cursor editor entries |
| `skills/goddesign/scripts/genimage.sh` | Cross-host image generation: hosts without native image tools delegate to an installed image-capable CLI |
| `skills/goddesign/scripts/verify-install.sh` | Install-integrity check: fails loud if a deck is missing rather than letting the model improvise it |
| `skills/goddesign/scripts/blind-read.sh` | Optional blind post-render critic: a separate process reads only the screenshots and reconstructs the page's identity |
| [`validation/`](validation/README.md) | Indexed evidence library: research, protocols, experiments, comparative runs, studies, and tools |
| `docs/` | Install guide, architecture, contributing |

## Validation

Seven skill runs on one brief produced seven fully distinct, gate-passing directions (terminal letter, Swiss manifesto, luxury serif, machine-room data-dense, editorial print, art deco dashboard, chartreuse signup) while three unskilled baseline runs reproduced the catalogued failures, including two pages that render completely blank in static capture due to scroll-reveal bugs. The audit script caught defects human review missed. Full evidence with screenshots: [validation/runs/kilnhouse-2026-07/README.md](validation/runs/kilnhouse-2026-07/README.md).

The tells catalog is a living artifact. The repeatable method for refreshing it against current public discourse is documented in [validation/protocols/sentiment-refresh-protocol.md](validation/protocols/sentiment-refresh-protocol.md).

Everything above is author-run validation, which proves the machinery rotates, not that outside judges agree. The pre-registered external studies that test the core claim (blind identification by 20+ outside raters, a five-brief matrix, cross-model replication), with bars fixed in advance and results published either way, live in [validation/protocols/external-validation-protocol.md](validation/protocols/external-validation-protocol.md).

Study A generation is complete: all 10 live human controls are captured and
hashed, and all 10 frozen generated brief pairs are complete across Codex and
Claude Code. Each host has 5 green skill audits, 5 same-model baselines
executed in neutral temporary workspaces, and 5 distinct direction rows. The
30-sample anonymized corpus and balanced 40-slot rater pack are frozen.
See [the human-control receipt](validation/studies/study-a-2026-07/human-control-receipt.json)
along with the [Codex replication receipt](validation/studies/study-a-2026-07/codex-replication-receipt.json)
and [Claude replication receipt](validation/studies/study-a-2026-07/claude-replication-receipt.json).
The 20 outside-rater responses are not complete, so this is not yet external
validation and the evidence badge remains unchanged. The
[Study A completion audit](validation/studies/study-a-2026-07/completion-audit.md)
records the requirement-by-requirement state.

After scoring closes, the analyzer emits a hash-sealed publication bundle and
re-runs from its own de-identified public rows. Private submission IDs remain
in a sealed integrity file, while deterministic recurring terms from
goddesign AI-yes reasons become the next recalibration input.

## Documentation

- [docs/INSTALL.md](docs/INSTALL.md): installation, requirements, per-host notes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how and why each mechanism works
- [CONTRIBUTING.md](CONTRIBUTING.md): the evidence bar for new rules, how to add deck rows
- [CHANGELOG.md](CHANGELOG.md): release history

## License

[MIT](LICENSE)
