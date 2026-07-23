# Changelog

## v1.4.0 (2026-07-23)

The evidence-readiness release: the skill's own review surfaced that every claim rested on author-run validation and a self-graded gate. This release fixes the process, not the pixels.

### External validation (the evidence gap)
- `validation/protocols/external-validation-protocol.md`: three pre-registered studies with bars fixed in advance and publish-either-way de-identified row-level data. Study A: blind identification test (30 anonymized samples: 10 goddesign, 10 unskilled baselines, 10 human-built; 20+ outside raters; goddesign must be indistinguishable from human-built and below baselines on AI-identification). Study B: five-brief matrix across categories (dashboard, portfolio, e-commerce, docs, event). Study C: cross-model replication of the EXPAND lane on Codex, which to date has no independent receipts.
- `scripts/study-a-pack.mjs` plus `validation/tools/blind-eval-pack.sh`: atomic Study A packer. Validates all 30 artifacts, matched hosts, green audits, and unique skill directions; strips method comments without deleting neighboring CSS; assigns cryptographic sample IDs; records SHA-256 integrity digests; seals arm metadata; and produces two balanced twenty-rater waves. Verified by executable tests.
- `scripts/study-a-capture.mjs`, `study-a-run-hosts.mjs`, `study-a-build-corpus.mjs`, `study-a-sync-rater.mjs`, and `study-a-links.mjs`: live control capture, isolated same-host skill and baseline execution, corpus assembly, deployment sync, and signed invitation generation.
- `study-a-rater/`: persistent de-identified study application with eligibility and consent, signed invitation slots, fifteen-sample resume, per-answer D1 persistence, strict response validation, and secret-protected operator CSV export.
- `scripts/study-a-analyze.mjs`: paired equivalence and baseline-superiority analysis. It rejects an incomplete or unbalanced study, flags duplicate, malformed, impossible-time, and possible-automation submissions without silently excluding integrity flags, reports sample-level failure rates, and publishes either verdict.
- The analyzer now reproduces the frozen statistics from its own de-identified public rows, emits the exact reproduction command, creates a SHA-256 publication manifest, and keeps private submission IDs in a sealed integrity file. Deterministic repeated words and two-word phrases from goddesign AI-yes reasons become explicit recalibration inputs.
- Live execution receipts now cover all ten human-control captures and all ten frozen generated pairs across Codex and Claude Code: ten green skill audits, ten same-model baselines, ten distinct direction rows, and eighty verified generated-artifact hashes.
- Every baseline was regenerated in a neutral temporary workspace after a Claude run exposed repository-path contamination. The runner rejects method markers before copying an artifact into evidence, and the corpus builder and receipt generator refuse legacy method-path baselines.
- The frozen 30-sample corpus and one balanced 40-slot blinded pack are complete. Its sealed manifest hash is `ca15b3113f9a4ab538f4ec047f8257f10bfe34425ac939dda4f768530d90b99b`.
- The rater application passed a full local D1 integration run with twenty signed development slots, three hundred persisted ratings, completion enforcement, secret-protected export, de-identification, exact tests, bootstrap, report generation, and zero integrity flags. The data was a synthetic test oracle and is not external evidence.
- Participant-visible payloads now use a neutral runtime study ID, and the built client bundle is scanned for method-name leaks. The protocol also rejects a participant hostname containing the method name.

### QA gate hardened
- Phase 1 self-critique demoted to advisory with mandatory evidence citations (every score cites the element, line, or screenshot region that earns it; uncited scores record as 1). The pass/fail gate is now explicitly Phase 2's boolean sweep plus Phase 3's measured audit, the two objective halves.
- Blind read promoted from optional to default-when-an-image-CLI-exists; skips require a stated reason recorded as `DEGRADED: no blind read (<reason>)`. Verdict stays advisory per the calibration finding.

### Process cost
- New Step 0 mode: scoped edits on a page already carrying a `/* goddesign | */` stamp reuse the stamped lock and skip Steps 2-3 (craft floor and full gate still apply). New pages, new macrostructures, or direction changes take the full path.
- No-shell seed fallback now sums the brief's character codes instead of counting its length; two same-length briefs on one day no longer collide on every pick.

### Deck treadmill
- Popularity cap in Step 3a: a direction appearing 3+ times, or a macrostructure 4+ times, across both ledgers' last 8 entries rests for a run.
- `CONTRIBUTING.md` genome intake expanded into a five-step extraction recipe (capture evidence, type system, palette breaks, grammar habits, density rhythm, signature, imperfections) so any user can contribute a human-genome row, not just the maintainer.

### Rule honesty and CI
- Every Banned-list entry is tagged [fingerprint] (avoided because the public recognizes it on sight) or [craft] (a defect no matter who ships it), so evidence-backed claims are distinguishable from taste.
- Step 0 now runs `scripts/detect-clis.sh`, a presence-only inventory for Codex, Claude Code, Cursor Agent, Cursor, Gemini CLI, OpenCode, Aider, Goose, GitHub Copilot, Amp, Amazon Q, Kiro, and Factory Droid. It distinguishes a desktop editor launcher from a headless agent and does not treat installation as proof of authentication or capability.
- CLI discovery is advisory only. Core design work remains independent of any editor, agent, model vendor, deployment platform, account, domain, DNS configuration, or network service.
- Host scope is now prompt-specified: one capable host receives the full QA gate and full score by default. Cross-host work runs only when the prompt explicitly requests comparison, replication, or compatibility testing, with named maintainer validation protocols as the only non-prompt exception. A missing second host never lowers the design score.
- `scripts/lint-decks.mjs` plus `.github/workflows/ci.yml`: 196 mechanical checks on every push. Deck sizes match SKILL.md seed moduli, every direction row is a complete package, every Banned bullet has an INSTEAD and a tag, host-scope guarantees and genome vantage caps hold, and no em/en dashes appear in prose.
- `validation/` is organized by purpose into `research/`, `protocols/`, `experiments/`, `runs/`, `studies/`, and `tools/`, with a root index and self-contained dated run directories.
- Repo hygiene: stray `.DS_Store` files removed (`.gitignore` already covered them).

## v1.3.0 (2026-07-22)

The seams release: three of the four ADHD-surfaced leverage seams implemented after the first (seeded subject-vantage) was tested and rejected. Full evaluation: `validation/research/adhd-evaluation-2026-07.md`.

### Install integrity (seam 3)
- `scripts/verify-install.sh`: host-neutral POSIX check that `SKILL.md` and the seven `references/*.md` decks are present and non-empty (exit 0 OK, exit 1 with `INCOMPLETE INSTALL: <file> not found`). A partial install can otherwise let the model improvise missing rows, recreating the model-authored distribution the skill exists to escape.
- SKILL.md Step 0 preflight and a Step 3c stop-rule enforce the same lazily on hosts with no shell; INSTALL.md documents the verify command.

### Blind post-render critic (seam 4)
- `scripts/blind-read.sh` + `references/blind-read.md`: a separate process sees ONLY the screenshots (never the code or the DIRECTION LOCK) and reconstructs the page's structure, paper band, display class, accent band, signature, subject, and one AI tell, closing the gap where Phase 1 self-critique is authored by the context holding the answer key.
- Shipped OPTIONAL and degrade-friendly (`DEGRADED: no blind read` with no penalty), wired into checklist.md Phase 3 as a Specificity aid, not a hard gate. Calibration on four owner-ranked Bandquarter renders (`validation/experiments/blind-read-calibration-2026-07/README.md`) showed accurate subject and signature recovery every time but no winner-from-loser separation, so it ships as an identity-recovery check, not a ranker.

### Genome sourcing intake (seam 2)
- `references/genome-sources.md` (ten maintainer-only sourcing vantages, never read during a design run) plus a `CONTRIBUTING.md` intake rule that formalizes the pre-existing prose provenance requirement into a schema: new genome rows carry `Genome: vantage=<0-9> | source=<domain> | captured=<YYYY-MM>`, with grep-checkable caps enforced in review (at most two rows per vantage; the two newest must not share one) so the human-genome lane keeps spreading instead of re-converging. Row 16 is grandfathered (`source=unrecorded-preschema`).

### Not adopted (seam 1)
- The seeded subject-vantage (seed the Subject test before the aesthetic deck) was tested across three subjects and rejected: it reliably diversifies the signature but does not beat the current Subject test on product-page quality (owner tie, then two proxy losses to the control). Recorded in `validation/experiments/subject-vantage-2026-07/README.md`; the Subject test and its "show the product working" clause hold unchanged.

## v1.2.1 (2026-07-22)

The evaluation release: an external skill assessed against the evidence bar, with no skill changes.

### Evaluated and declined (ADHD)
- The ADHD reasoning skill (UditAkhourii/adhd, MIT) was evaluated as a candidate to borrow from via a four-phase multi-agent investigation (four recon readers, thirty proposals across six angles, a four-lens adversarial attack on every candidate, synthesis on Codex gpt-5.6-sol xhigh). Full record: `validation/research/adhd-evaluation-2026-07.md`.
- Verdict: borrow the diagnosis, decline the cure. ADHD and goddesign fight the same enemy (convergence) with opposite medicine; ADHD's parallel fan-out multiplies the model distribution the skill exists to escape, costs five to ten times a run, and cannot be guaranteed on the Codex host. Declined: the fan-out, the score chips, and the 0.35 / 0.40 / 0.25 weighting.
- Four leverage seams recorded as hypotheses with kill criteria, none shipped: seed the Subject test before the aesthetic deck (highest value), point cognitive frames at human-genome sourcing rather than new authored rows, fail loudly on an incomplete install, and prototype one blind post-render critic. The seam-1 validation experiment is the recorded next action; nothing enters the skill until it earns a blind owner ranking.
- Benchmark treated as hypotheses, not admission evidence: `bench/results.json` has four problems, one sample per arm, no significance test, a trap-detection metric that is a format artifact, and one showcase problem won by the baseline (builder usefulness 9 versus 4).

## v1.2.0 (2026-07-18)

The avenues release: new ways for a design to come into being, plus trust.

### Conception avenues
- Comp-first mode (owner's idea, proven end to end same day): when an image tool is available, generate one lock-derived full-page mockup and replicate it in HTML; the comp governs composition, the lock governs values, comp text is never transcribed. Recommended by default on the EXPAND lane. Proof pair archived (comp and replication) in `validation/`.
- Conception map: a single page may mix up to three conception avenues per section (comp, artifact-first, human-genome grammar, copy-first), declared in the lock; mixed conception, never mixed identity: every avenue executes the same lock.
- SVG-first experiment: FAILED and recorded plainly (page-scale hand-placed coordinates misalign; top-level file:// SVGs with remote font imports hang renderers). No skill changes; the test-first protocol contained it.

### Trust (from a controlled 48-participant study, Martinovikj 2025, cited in validation/research/external-evidence-2026-07.md)
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
- Forensics on 5 real Claude-built production sites plus 7 test runs identified seven grammar tells that survive font/palette/structure rotation (band metronome, eyebrow ceremony, three-caste type, rationed accent with headline spans, uniform finish, symmetrized content, stock ornament kit). Evidence: `validation/research/claude-grammar-2026-07.md`.
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
- Four comparative rounds archived (`validation/runs/`): goddesign 12 of 12 external audits green with no repeated identity; the official frontend-design skill 0 of 12 with per-domain concept/font/palette convergence (one display font shared across 11 of 12 of its runs). Round 5 ended in the owner's first goddesign 1-2 finish, under the full stack.

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
- 346-comment verified public-sentiment study with per-quote source URLs and verification tiers (`validation/research/sentiment-evidence-2026-07.md`).
- Full validation round: 7 distinct gate-passing skill runs vs 3 baseline runs reproducing the catalogued failures, all artifacts archived (`validation/runs/kilnhouse-2026-07/README.md`).
- Repeatable catalog-refresh protocol (`validation/protocols/sentiment-refresh-protocol.md`).
