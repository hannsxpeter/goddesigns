# Changelog

## Unreleased

- Automatic triggering: the skill description now enumerates concrete trigger phrases (landing page, dashboard, hero section, pricing page, mockup-to-code, restyle, "make it look better", any HTML/CSS/Tailwind/React styling) so hosts that auto-select skills fire it without the command; standing-instruction snippets for `CLAUDE.md` and `AGENTS.md` documented in `docs/INSTALL.md`.
- README notes that the command is optional.

## v1.0.0 (2026-07-18)

First public release.

### The skill
- Two-lane design: DIVERGE (seeded picks + reroll rule + steering override for taste-heavy models) and EXPAND (fully enumerated decisions + named failure symptoms for literal-execution models).
- Variance engine: seed-indexed decks (16 directions, 12 macrostructures, 10 palettes, 12 type pairings), per-project run ledger, and seeded jitter (accent hue rotation, paper lightness nudge, radius step via CSS relative color) for population-scale uniqueness.
- DIRECTION LOCK accountability format; numeric craft floor; evidence-derived Banned list with INSTEAD replacements.
- Gated imagery: cross-host image generation with lock-derived prompts, honesty rules, and a two-regeneration cap.

### Verification tooling
- `scripts/audit.mjs`: measured per-viewport audit (overflow, text collisions, hidden-content reveal bugs, sub-24px targets, silent font fallbacks) with screenshots and JSON verdicts.
- Bounded self-correction loop: audit-named failures only, lock frozen, maximum 3 cycles.
- `scripts/codex-audit-loop.sh`: sandboxed-Codex operator wrapper (build inside, audit outside, resume-feedback into the same session) plus machine-readable `audit-handoff.sh` on DEGRADED runs.
- `scripts/genimage.sh`: image-generation delegation chain (Codex rung verified; extensible).

### Evidence
- 346-comment verified public-sentiment study with per-quote source URLs and verification tiers (`validation/sentiment-evidence-2026-07.md`).
- Full validation round: 7 distinct gate-passing skill runs vs 3 baseline runs reproducing the catalogued failures, all artifacts archived (`validation/kilnhouse-2026-07.md`).
- Repeatable catalog-refresh protocol (`validation/sentiment-refresh-protocol.md`).
