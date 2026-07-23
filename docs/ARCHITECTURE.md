# Architecture

How goddesign works and why each mechanism exists. Every design decision below traces to measured evidence: a 346-comment verified study of public sentiment about AI frontend design ([validation/research/sentiment-evidence-2026-07.md](../validation/research/sentiment-evidence-2026-07.md)) plus defects observed in real validation runs ([validation/runs/kilnhouse-2026-07/README.md](../validation/runs/kilnhouse-2026-07/README.md)).

## The problem, measured

Public discourse names two opposite failure modes:

- Taste-heavy models (Claude-class) converge: purple gradient heroes, cream-serif-terracotta pages, the unthemed shadcn kit look, scroll-reveal cascades. The top complaint cluster (15 independent comments) is that these sites are identifiable on sight.
- Literal models (GPT/Codex-class) under-design: browser defaults, one recycled template that resists instruction ("one-template gravity", 11 comments), decisions returned as adjectives instead of values (7 comments).

A ban list alone cannot fix this: bans redirect probability mass to the next attractor (the cream-terracotta cliche is itself the product of everyone banning purple). Variety has to come from a mechanism.

## The two lanes

**DIVERGE** (taste-heavy models): the model must take an external seed's pick and reroll whenever instinct drifts toward a named attractor. A steering override forces a both-axes reroll when the brief says "not like typical AI design", because measured behavior shows such briefs otherwise still produce the house look.

**EXPAND** (literal models, and the default): every decision arrives enumerated: hexes, named fonts and weights, an import line, radius, motion numbers. The lane names its own failure symptoms (placeholder floor, template snap-back, architecture instead of pixels) and re-checks for them at the gate.

## The variance engine

- A shell-derived seed indexes 17 aesthetic directions, 12 macrostructures, 10 palette families, and 12 type pairings. Rows are complete packages; blending is banned.
- A per-project run ledger (`.design-log.json`) forces rotation across runs, with a popularity cap: any direction appearing 3+ times, or macrostructure 4+ times, in the last 8 entries across both ledgers rests for a run.
- Scoped edits skip the ceremony: a page already carrying a `/* goddesign | */` stamp reuses its stamped lock for restyle-and-fix tasks, running only the craft floor and the QA gate; new pages, new macrostructures, or direction changes take the full path.
- **Seeded jitter** rotates the accent hue (-12 to 12 degrees), nudges paper lightness, and steps radius via CSS relative color, so two projects that land on the same row never ship identical values. This is the population-scale defense: the deck provides 17 looks, jitter makes them thousands.

## The DIRECTION LOCK

Every visual decision is written in plain text before any code: seed numbers, tokens, jitter, type, layout sketch, signature element, motion budget. The lock is the accountability artifact: the gate compares the rendered page against it, and the self-correction loop is forbidden from changing it.

## The QA gate

Three phases, in `references/checklist.md`:

1. **Self-critique**: seven axes scored 1-5 (Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety, Credibility). Advisory, with mandatory evidence citations: the same context that made the choices grades them, so every score must cite the element, line, or screenshot region that earns it, and an uncited score records as 1. Credibility entered from a controlled 48-participant study (cited in validation/research/external-evidence-2026-07.md) whose one replicated finding is that AI-built sites lose trust and credibility while winning polish; a trust-surface gate (who is behind this, how to reach them, what are the terms) enforces it mechanically.
2. **Boolean sweep**: one testable assertion per line, including case-insensitive greps for banned values. Pass/fail gate, first half.
3. **Visual verification**: the measured audit (`scripts/audit.mjs`) detects horizontal overflow, text-on-text collisions, content hidden at effective opacity 0 (the reveal bug that made both vendors' baseline pages render blank), sub-24px targets, and silently fallen-back webfonts, per viewport, with screenshots. Pass/fail gate, second half. A bounded self-correction loop fixes only audit-named failures, lock frozen, maximum 3 cycles. The blind read runs by default when an image-capable CLI exists (a separate process sees only the pixels and reconstructs the page's identity; advisory verdict, mandatory attempt). Hosts that cannot render fall back through a screenshot chain to an honest `DEGRADED` declaration with a machine-readable operator handoff.

## Cross-host design constraints

- Only `name` and `description` frontmatter: no host-specific syntax anywhere.
- Every rule resolves to a number, a hex, a greppable string, or a yes/no test, so a literal-execution model can verify it without taste.
- Scripts are plain POSIX shell and Node; each degrades gracefully and states its skip.
- Host discovery is explicit and presence-only: `scripts/detect-clis.sh` inventories known agent commands on `PATH`, distinguishes Cursor Agent from the Cursor editor launcher, and never treats installation as proof of authentication or capability.
- Discovery never becomes lock-in: core design work requires no particular CLI, editor, model vendor, deployment platform, account, domain, DNS configuration, or network service.
- Cross-host means portable, not multi-host by default. Host scope is prompt-specified: a design run uses its active host unless the user explicitly requests comparison, replication, or compatibility testing across hosts. A second host is otherwise neither required nor scored. Named maintainer validation protocols are the only non-prompt exception.
- Capabilities the host lacks are delegated: image generation shells out to an installed image-capable CLI (`scripts/genimage.sh`); sandboxed Codex gets an outside-the-sandbox audit loop (`scripts/codex-audit-loop.sh`).

## Imagery

Gated, not ambient: pixels only when the seeded macrostructure, the row's signature, or the brief demands them; most runs ship zero raster images and generating an unrequested one is scored as a Restraint failure. When imagery fires, the prompt derives from the DIRECTION LOCK (locked hexes, row medium, composition, light) with mandatory negative clauses against the generic AI-image look, honesty rules against fabricated people, and a two-regeneration cap.

## The taste loop

Mechanical metrics (audits, distinctness) are necessary and insufficient: the skill's owner ranked competitor pages above audit-green goddesign pages until owner verdicts were compiled into rules (the Subject test, the substance gate, the atmosphere layer, grammar breaks). The loop is deliberate: a one-line human verdict becomes a mechanically-checkable rule the same day, and the next validation round tests it. Three owner-caught clustering axes (accent hues, color pairings, depth treatments) are now measured and capped in the deck, and the process is repeatable for any axis caught next.

## The grammar layer

Forensics on real Claude-built production sites identified seven compositional tells that survive font/palette/structure rotation: the band metronome, the eyebrow ceremony, three-caste type, the rationed accent, uniform finish, symmetrized content, and a stock ornament kit (full evidence in `validation/research/claude-grammar-2026-07.md`). Every page must now break that grammar in declared, gated ways: a band that escapes the container, a section with no heading ceremony, an orphan grid cell, uneven padding rhythm. The breaks are written into the DIRECTION LOCK and verified by the Grammar gate group.

## The conception avenues

Conception is multiplied deliberately: the same disciplined executor (lock, gates, audit) can receive a design imagined through different acts, each with different defaults. Proven avenues: the seeded deck (curated form), human-genome rows (real-world grammar), and comp-first mode, in which an image model renders a lock-derived full-page mockup and the code model replicates it (comp governs composition, lock governs values, comp text is never transcribed; validated end to end, proof pair in validation/). A page may mix up to three avenues, declared in the lock's conception map: mixed conception, never mixed identity. Avenues are admitted by a test-first protocol; a failed candidate (page-scale SVG-first) is recorded in the evidence and kept out of the skill.

## The human-genome lane

A model cannot author its way out of its own distribution: every Claude-authored deck row, however varied, is still drawn from the distribution being escaped. Deck rows 16 and up are therefore genomes extracted from real human-built sites (single-family type systems, full-coverage accent bands, business-fact grammar, deliberate unevenness), which Claude executes but did not design. The lane grows as the owner supplies admired sites; the long-term intent is for human genomes to outnumber authored rows.

## The refresh loop

The recognizable-AI look is a moving target, so the tells catalog is a living artifact. [validation/protocols/sentiment-refresh-protocol.md](../validation/protocols/sentiment-refresh-protocol.md) documents the repeatable collect, verify, cluster, encode, validate cycle that keeps the skill current. New tells require counted, sourced evidence and land in three places: the DIVERGE attractor list, the Banned list (with an INSTEAD that points back into the deck), and the QA gate.

## Evaluated and declined

The same evidence bar that admits mechanisms also records what was evaluated and kept out, so the reasoning survives. The page-scale SVG-first conception avenue failed on coordinate alignment and renderer reliability and is documented in [validation/experiments/comp-first-2026-07/README.md](../validation/experiments/comp-first-2026-07/README.md). The ADHD reasoning skill (UditAkhourii/adhd, MIT) was evaluated as a candidate to borrow from and its parallel fan-out declined: it fights convergence, as goddesign does, but by multiplying the model distribution the skill exists to escape, at five to ten times the cost, on a mechanism the Codex host cannot guarantee. The borrow-and-decline verdict, the four native leverage seams it surfaced (each a hypothesis with a kill criterion, none shipped), and a grounded critique of its benchmark are recorded in [validation/research/adhd-evaluation-2026-07.md](../validation/research/adhd-evaluation-2026-07.md).
