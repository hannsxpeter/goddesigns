# External evaluation: the wayfinder skill, 2026-07-31

Source: `mattpocock/skills`, skill `skills/engineering/wayfinder` (https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md), MIT licensed, "Copyright (c) 2026 Matt Pocock". A planning skill for coding agents: an effort too large for one agent session is charted as a shared map of decision tickets on the repo's issue tracker, then the tickets are resolved one per session until the way to a named destination is clear.

This is a planning skill, not a design skill, and that difference is the whole finding, so it is stated first.

## The relationship, and why it constrains what is safe to borrow

wayfinder and goddesign sit on opposite sides of the same line. wayfinder is planning by default: it produces decisions, not deliverables, and hands execution off once the map is complete. goddesign is execution: it exists to put a designed, gated page on disk in one run. Adopting wayfinder's default mode would turn a design skill into a planning skill, which is the one borrowing that would do real damage.

What wayfinder does correctly identify is a hole goddesign has never covered. Every mechanism in goddesign is scoped to a single run. Its only artifact that outlives a run is `.design-log.json`, and that ledger's entire job is to make the **next** run **differ** from the last. Across unrelated projects that is exactly right and is the anti-convergence engine. Across the surfaces of one product it is backwards: it pushes the pricing page away from the marketing page it has to match.

Three consequences follow, and all three are derivable from rules already in the skill rather than asserted:

1. **Rotation inverts against the user.** Step 3a requires the direction to differ from the previous entry on paper band, display class, or accent hue band. A second session designing a sibling surface of the same product therefore starts by being pushed off the system it must join. Nothing in the skill exempts it.
2. **The ledger floods, and the flood is self-inflicted.** Step 3a rests any direction appearing 3 or more times, or any macrostructure 4 or more times, across the last 8 entries of both ledgers. A nine-surface product writing one entry per surface trips its own popularity cap by the third surface, and then fills the entire 8-entry window with one product, so the next unrelated project rotates against noise. The cap was built to catch a direction the rotation keeps landing on; a multi-surface effort makes it misfire.
3. **Scope collapses at the context wall.** The EXPAND lane says "do not silently trim scope" and enumerates the full deliverable up front. For a nine-surface brief that instruction is unkeepable in one 100K session: the honest outcome is three good surfaces and six wireframes. The rule needs a mechanism, not more emphasis.

None of this was surfaced by a failing validation run. It was found by reading goddesign against wayfinder's diagnosis, and the arithmetic above is the evidence that the defect is structural rather than hypothetical.

## How this was evaluated

A single-session read of the wayfinder SKILL.md in full against goddesign's SKILL.md, `references/checklist.md`, `scripts/verify-install.sh`, `scripts/lint-decks.mjs`, `docs/ARCHITECTURE.md`, and `CONTRIBUTING.md`, followed by implementation. This is a lighter process than the four-phase multi-agent investigation behind `adhd-evaluation-2026-07.md`, and the confidence attached to it is correspondingly lower. See "Weight and limitations".

## What was borrowed

Seven of wayfinder's disciplines transfer, all of them structural. They ship as `skills/goddesign/references/map.md` plus `scripts/verify-map.mjs`, wired into Step 0 item 3, Step 3a, Step 4a, Step 5, and the QA gate.

1. **The map is an index, not a store.** The map gists each locked surface in one line and links to the file holding it. A design value lives in exactly one place, its stylesheet stamp, so there is one place it can be wrong.
2. **The destination is named first, and it fixes the scope.** Every later surface-or-out-of-scope call resolves against it.
3. **Fog of war, with a sharpness test.** goddesign's test is native and mechanical: a surface is listable when its one action and its audience can each be written in one line (Step 2's context gate). If they cannot, it stays in **Not yet specified**. Pre-slicing fog into surface-shaped pieces is the same defect as writing "use gray" instead of a hex.
4. **Out of scope is a separate section that never graduates.** Work past the destination is not fog. A surface found to sit beyond the destination is ruled out with a reason and never lands in **Surfaces locked**, which records the system actually built.
5. **Claim before work.** A surface line carries `claimed: <YYYY-MM-DD> <host>`, written before any design work, so concurrent sessions skip it.
6. **One ticket per session becomes one surface per session.** This is what makes the EXPAND lane's no-trimming rule keepable.
7. **The HITL and AFK split becomes the Open questions rule.** goddesign tells the model to invent confidently where the brief is silent (Step 2) and forbids inventing metrics, testimonials, logos, and company names (Step 4c). Those collide whenever a surface needs a real number nobody supplied, and today the model either stalls or fabricates. The map adds the third option and makes it the only correct one: ship a labeled placeholder, park the question with a date, never answer it on the person's behalf.

## What is goddesign-native, not borrowed

The part that makes the map work is not in wayfinder, because wayfinder has no analogue for it. Its map indexes heterogeneous decisions; goddesign's decisions are one coherent visual system.

- **The System lock.** The map carries exactly one DIRECTION LOCK, rolled once at charting with the full variance engine including the Step 3d jitter. Every surface session inherits Seed, Tokens, Jitter, Type, Import, Motion, and Atmosphere verbatim and chooses fresh only Structure, Layout, Signature, Grammar, and the conception map.
- **The three inversions.** The seed rolls once per map, not once per surface; rotation applies at charting and then surfaces must match rather than differ; and a map writes exactly one ledger entry, when its last surface locks. The third is the fix for defect 2 above.
- **A mechanical validator.** `scripts/verify-map.mjs` parses the map and checks the eight required sections and their order, the System lock's seven fields and five hex tokens, the shape of every surface line, claim format, one-surface-one-state, and dated open questions. Exit 0 green, 1 named failures, 2 no map. It prints the ledger-entry reminder when the map completes. `scripts/lint-decks.mjs` additionally checks that the validator's required sections and the deck's documented template cannot drift apart.

## What was declined, and why

- **The issue tracker as the substrate.** `docs/ARCHITECTURE.md` states that core design work requires no account, network service, or platform. A tracker-backed map would break that outright. wayfinder itself names a local-markdown fallback; goddesign takes only the fallback and makes it the entire mechanism, as `.design-map.md` beside `.design-log.json`.
- **Blocking edges and the frontier.** Design surfaces are not a dependency graph in any useful sense: once the System lock exists, any surface is designable. What actually matters is ordering (design the densest real screen first, because a system proven on a dashboard extends to a hero and a system proven on a hero collapses on a dashboard). The map states that ordering rule and skips the edges, which would be ceremony modelling a dependency that does not exist.
- **The four ticket types and their named sub-skills** (`/research`, `/grilling`, `/domain-modeling`, `/prototype`). These belong to wayfinder's own skill ecosystem. goddesign's Step 2 context gate already occupies that surface in one paragraph and explicitly forbids stalling on questions. Only the HITL and AFK distinction survives, as the Open questions rule.
- **Research subagents fired in parallel.** Declined for the reasons already recorded against ADHD's fan-out in `adhd-evaluation-2026-07.md`: cost, and a parallel-isolation guarantee the Codex host does not provide. Nothing in wayfinder changes that analysis.
- **Planning as the default mode.** The load-bearing inversion between the two skills. Charting borrows the no-pixels rule for exactly one session; every session after it builds.
- **Referring to everything by name rather than by id.** Already native. goddesign names its deck rows ("Workbench", "Marquee Hero", "Machine Room") and `.design-log.json` stores names, not indices. Nothing to borrow.

## The threshold, and the cost of getting it wrong

A map costs one session that produces no pixels. Charting one for a two-page brief is pure ceremony, so the trigger is mechanical and narrow: 3 or more distinct surfaces, a stated hand-off, or an existing `.design-map.md`. Charting that surfaces fewer than 3 specifiable surfaces and no fog ends with deleting the map and designing directly, which is stated in the deck as a step, not a caveat.

## License and attribution

wayfinder is MIT, "Copyright (c) 2026 Matt Pocock". No text, code, or prompt content was copied. `references/map.md` and `scripts/verify-map.mjs` are goddesign-native prose and code built on wayfinder's diagnosis and structural vocabulary; `references/map.md` carries a provenance note naming the source and its licence. If goddesign later copies wayfinder text verbatim, retain the full MIT notice for the copied portion in a third-party notices file and beside the copied material.

## Weight and limitations

This is an evaluation and implementation record, not a validation result, and it is weaker evidence than the ADHD record it is modelled on in two specific ways. It came from a single-session read rather than an adversarially filtered multi-agent investigation. And no multi-surface map has yet been run end to end: the mechanism is verified mechanically (the validator passes its own fixtures, `verify-install.sh` and `lint-decks.mjs` are green at 214 checks) and derived from rules already in the skill, but it has not been tested against real renders across two sessions.

Per the evidence bar in `CONTRIBUTING.md`, it enters as structural machinery rather than as a new tell: it adds no banned pattern, changes no craft-floor number, and touches no visual rule. Nothing about a single-surface run changes.

Kill criterion, recorded in advance. The mechanism comes out if either holds on the first real multi-surface run: the blind read (`scripts/blind-read.sh`) assigns two surfaces of one map to visibly different systems, meaning inheritance did not actually hold across sessions; or charting plus per-surface overhead costs more than it saves on a 4-surface effort, meaning the 3-surface threshold is set too low and should move up or the map should be abandoned. The validating run is the recorded next action.
