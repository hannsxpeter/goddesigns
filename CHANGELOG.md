# Changelog

## v1.3.0 (2026-07-22)

The seams release: three of the four ADHD-surfaced leverage seams implemented after the first (seeded subject-vantage) was tested and rejected. Full evaluation: `validation/adhd-evaluation-2026-07.md`.

### Install integrity (seam 3)
- `scripts/verify-install.sh`: host-neutral POSIX check that `SKILL.md` and the seven `references/*.md` decks are present and non-empty (exit 0 OK, exit 1 with `INCOMPLETE INSTALL: <file> not found`). A partial install can otherwise let the model improvise missing rows, recreating the model-authored distribution the skill exists to escape.
- SKILL.md Step 0 preflight and a Step 3c stop-rule enforce the same lazily on hosts with no shell; INSTALL.md documents the verify command.

### Blind post-render critic (seam 4)
- `scripts/blind-read.sh` + `references/blind-read.md`: a separate process sees ONLY the screenshots (never the code or the DIRECTION LOCK) and reconstructs the page's structure, paper band, display class, accent band, signature, subject, and one AI tell, closing the gap where Phase 1 self-critique is authored by the context holding the answer key.
- Shipped OPTIONAL and degrade-friendly (`DEGRADED: no blind read` with no penalty), wired into checklist.md Phase 3 as a Specificity aid, not a hard gate. Calibration on four owner-ranked Bandquarter renders (`validation/blind-read-calibration-2026-07.md`) showed accurate subject and signature recovery every time but no winner-from-loser separation, so it ships as an identity-recovery check, not a ranker.

### Genome sourcing intake (seam 2)
- `references/genome-sources.md` (ten maintainer-only sourcing vantages, never read during a design run) plus a `CONTRIBUTING.md` intake rule that formalizes the pre-existing prose provenance requirement into a schema: new genome rows carry `Genome: vantage=<0-9> | source=<domain> | captured=<YYYY-MM>`, with grep-checkable caps enforced in review (at most two rows per vantage; the two newest must not share one) so the human-genome lane keeps spreading instead of re-converging. Row 16 is grandfathered (`source=unrecorded-preschema`).

### Not adopted (seam 1)
- The seeded subject-vantage (seed the Subject test before the aesthetic deck) was tested across three subjects and rejected: it reliably diversifies the signature but does not beat the current Subject test on product-page quality (owner tie, then two proxy losses to the control). Recorded in `validation/subject-vantage-2026-07.md`; the Subject test and its "show the product working" clause hold unchanged.

### Packaging
- Published as an npm package to GitHub Packages, `@hannsxpeter/goddesign`, with a `goddesign-install` bin that symlinks the skill into the host directories. This is a convenience mirror; the `git clone` + symlink install stays the recommended path because GitHub Packages requires token auth even for public installs (docs/INSTALL.md).

## v1.2.1 (2026-07-22)

The evaluation release: an external skill assessed against the evidence bar, with no skill changes.

### Evaluated and declined (ADHD)
- The ADHD reasoning skill (UditAkhourii/adhd, MIT) was evaluated as a candidate to borrow from via a four-phase multi-agent investigation (four recon readers, thirty proposals across six angles, a four-lens adversarial attack on every candidate, synthesis on Codex gpt-5.6-sol xhigh). Full record: `validation/adhd-evaluation-2026-07.md`.
- Verdict: borrow the diagnosis, decline the cure. ADHD and goddesign fight the same enemy (convergence) with opposite medicine; ADHD's parallel fan-out multiplies the model distribution the skill exists to escape, costs five to ten times a run, and cannot be guaranteed on the Codex host. Declined: the fan-out, the score chips, and the 0.35 / 0.40 / 0.25 weighting.
- Four leverage seams recorded as hypotheses with kill criteria, none shipped: seed the Subject test before the aesthetic deck (highest value), point cognitive frames at human-genome sourcing rather than new authored rows, fail loudly on an incomplete install, and prototype one blind post-render critic. The seam-1 validation experiment is the recorded next action; nothing enters the skill until it earns a blind owner ranking.
- Benchmark treated as hypotheses, not admission evidence: `bench/results.json` has four problems, one sample per arm, no significance test, a trap-detection metric that is a format artifact, and one showcase problem won by the baseline (builder usefulness 9 versus 4).

## v1.2.0 (2026-07-18)

The avenues release: new ways for a design to come into being, plus trust.

### Conception avenues
- Comp-first mode (owner's idea, proven end to end same day): when an image tool is available, generate one lock-derived full-page mockup and replicate it in HTML; the comp governs composition, the lock governs values, comp text is never transcribed. Recommended by default on the EXPAND lane. Proof pair archived (comp and replication) in `validation/`.
- Conception map: a single page may mix up to three conception avenues per section (comp, artifact-first, human-genome grammar, copy-first), declared in the lock; mixed conception, never mixed identity: every avenue executes the same lock.
- SVG-first experiment: FAILED and recorded plainly (page-scale hand-placed coordinates misalign; top-level file:// SVGs with remote font imports hang renderers). No skill changes; the test-first protocol contained it.

### Trust (from a controlled 48-participant study, Martinovikj 2025, cited in validation/external-evidence-2026-07.md)
- Credibility added as the seventh self-critique axis: the study's one replicated finding is that AI-built sites lose Trust/Security and Credibility/Professionalism in every pair while winning polish dimensions.
- Trust-surface gate: every page answers who is behind it, how to reach them, and the material terms; sample-labeled in demos, truthful in real projects.
- The study's suspicion inversion (the human agency site was most suspected of being AI, because polished generic layouts read as AI) recorded as third-party validation of the grammar program.

### Calibration
- The no-skill baseline's high appeal recorded honestly: appeal and tells coexist; the skill's bar is raw Claude's best day plus honesty, correctness, and non-repetition.

## v1.1.0 (2026-07-18)

The owner-taste release: five comparative validation rounds in one day, each owner verdict compiled into mechanism the same day.

### The taste loop
- Subject test (Step 4b): the signature element and at least one motif must be artifacts of the subject's world drawn in the locked direction's formal language; the page must show the product working.
- Substance gate: at least one structured artifact of the product working per page; pure-assertion pages fail regardless of typographic beauty.
- Atmosphere layer: the row's background treatment is mandatory ground treatment (texture, depth, overlap), exempt from the signature budget; flat band-stacks of rectangular panels fail.
- Audience-fit remix trigger in Step 3c.

### The grammar system
- Forensics on 5 real Claude-built production sites plus 7 test runs identified seven grammar tells that survive font/palette/structure rotation (band metronome, eyebrow ceremony, three-caste type, rationed accent with headline spans, uniform finish, symmetrized content, stock ornament kit). Evidence: `validation/claude-grammar-2026-07.md`.
- Counters encoded: mandatory declared grammar breaks (container escape, ceremony-free section, orphan cells, padding variance with the global `section { padding }` rule banned), stock-ornament-kit and headline-accent-span bans, and a seven-line Grammar gate group in the checklist.

### Deck integrity (three clustering axes caught by the owner, all capped)
- Accent hues rebalanced (Brutalist to magenta + Syne, Cinematic to ice, Neobrutalist to green, Industrial off gold to safety orange) with a 2-rows-per-hue-band authoring cap.
- Depth-language uniqueness: hard offset shadows exclusive to Neobrutalist, sticker outline to Playful Pop, tilt to Lo-Fi Riso; the offset-shadow-plus-tilt-plus-chips kit is a flagged Claude default.
- Cross-project user ledger (`~/.design-log.json`): rotation constraints now hold across all of a user's projects, with a no-3-in-a-row rule on accent and paper bands.

### The human-DNA lane
- Deck row 16 "Trade Counter": the first direction derived from a real human-built site rather than authored by Claude (single-family weight-driven type, full-coverage accent bands, diagonal cuts, phone-forward, no heading ceremony). Deck moduli updated 16 to 17 everywhere. Human-genome rows are the structural answer to "a model cannot author its way out of its own distribution"; more rows land as the owner supplies admired sites.

### Triggering and docs
- Automatic triggering: trigger vocabulary in the skill description plus standing-instruction snippets for `CLAUDE.md`/`AGENTS.md` (docs/INSTALL.md); the command is optional.

### Evidence
- Four comparative rounds archived (`validation/archive/`): goddesign 12 of 12 external audits green with no repeated identity; the official frontend-design skill 0 of 12 with per-domain concept/font/palette convergence (one display font shared across 11 of 12 of its runs). Round 5 ended in the owner's first goddesign 1-2 finish, under the full stack.

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
- Full validation round: 7 distinct gate-passing skill runs vs 3 baseline runs reproducing the catalogued failures, all artifacts archived (`validation/archive/2026-07-kilnhouse/kilnhouse-2026-07.md`).
- Repeatable catalog-refresh protocol (`validation/sentiment-refresh-protocol.md`).
