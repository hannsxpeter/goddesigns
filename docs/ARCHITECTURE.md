# Architecture

How goddesign works and why each mechanism exists. Every design decision below traces to measured evidence: a 346-comment verified study of public sentiment about AI frontend design ([validation/sentiment-evidence-2026-07.md](../validation/sentiment-evidence-2026-07.md)) plus defects observed in real validation runs ([validation/kilnhouse-2026-07.md](../validation/kilnhouse-2026-07.md)).

## The problem, measured

Public discourse names two opposite failure modes:

- Taste-heavy models (Claude-class) converge: purple gradient heroes, cream-serif-terracotta pages, the unthemed shadcn kit look, scroll-reveal cascades. The top complaint cluster (15 independent comments) is that these sites are identifiable on sight.
- Literal models (GPT/Codex-class) under-design: browser defaults, one recycled template that resists instruction ("one-template gravity", 11 comments), decisions returned as adjectives instead of values (7 comments).

A ban list alone cannot fix this: bans redirect probability mass to the next attractor (the cream-terracotta cliche is itself the product of everyone banning purple). Variety has to come from a mechanism.

## The two lanes

**DIVERGE** (taste-heavy models): the model must take an external seed's pick and reroll whenever instinct drifts toward a named attractor. A steering override forces a both-axes reroll when the brief says "not like typical AI design", because measured behavior shows such briefs otherwise still produce the house look.

**EXPAND** (literal models, and the default): every decision arrives enumerated: hexes, named fonts and weights, an import line, radius, motion numbers. The lane names its own failure symptoms (placeholder floor, template snap-back, architecture instead of pixels) and re-checks for them at the gate.

## The variance engine

- A shell-derived seed indexes 16 aesthetic directions, 12 macrostructures, 10 palette families, and 12 type pairings. Rows are complete packages; blending is banned.
- A per-project run ledger (`.design-log.json`) forces rotation across runs.
- **Seeded jitter** rotates the accent hue (-12 to 12 degrees), nudges paper lightness, and steps radius via CSS relative color, so two projects that land on the same row never ship identical values. This is the population-scale defense: the deck provides 16 looks, jitter makes them thousands.

## The DIRECTION LOCK

Every visual decision is written in plain text before any code: seed numbers, tokens, jitter, type, layout sketch, signature element, motion budget. The lock is the accountability artifact: the gate compares the rendered page against it, and the self-correction loop is forbidden from changing it.

## The QA gate

Three phases, in `references/checklist.md`:

1. **Self-critique**: six axes scored 1-5; any score under 3 forces revision.
2. **Boolean sweep**: one testable assertion per line, including case-insensitive greps for banned values.
3. **Visual verification**: the measured audit (`scripts/audit.mjs`) detects horizontal overflow, text-on-text collisions, content hidden at effective opacity 0 (the reveal bug that made both vendors' baseline pages render blank), sub-24px targets, and silently fallen-back webfonts, per viewport, with screenshots. A bounded self-correction loop fixes only audit-named failures, lock frozen, maximum 3 cycles. Hosts that cannot render fall back through a screenshot chain to an honest `DEGRADED` declaration with a machine-readable operator handoff.

## Cross-host design constraints

- Only `name` and `description` frontmatter: no host-specific syntax anywhere.
- Every rule resolves to a number, a hex, a greppable string, or a yes/no test, so a literal-execution model can verify it without taste.
- Scripts are plain POSIX shell and Node; each degrades gracefully and states its skip.
- Capabilities the host lacks are delegated: image generation shells out to an installed image-capable CLI (`scripts/genimage.sh`); sandboxed Codex gets an outside-the-sandbox audit loop (`scripts/codex-audit-loop.sh`).

## Imagery

Gated, not ambient: pixels only when the seeded macrostructure, the row's signature, or the brief demands them; most runs ship zero raster images and generating an unrequested one is scored as a Restraint failure. When imagery fires, the prompt derives from the DIRECTION LOCK (locked hexes, row medium, composition, light) with mandatory negative clauses against the generic AI-image look, honesty rules against fabricated people, and a two-regeneration cap.

## The refresh loop

The recognizable-AI look is a moving target, so the tells catalog is a living artifact. [validation/sentiment-refresh-protocol.md](../validation/sentiment-refresh-protocol.md) documents the repeatable collect, verify, cluster, encode, validate cycle that keeps the skill current. New tells require counted, sourced evidence and land in three places: the DIVERGE attractor list, the Banned list (with an INSTEAD that points back into the deck), and the QA gate.
