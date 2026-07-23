# External validation protocol

Every published goddesign claim currently rests on author-run validation: the author picked the briefs, ran the runs, and ranked the outputs. That proves the machinery rotates; it does not prove the core claim (output that is not identifiable as AI-made) holds under judges who are not the author. This file pre-registers the three studies that close that gap, so the bars exist before the results do.

Rule zero: results publish either way, with de-identified row-level data included as a dated file in `validation/`. The operator export containing precise timestamps remains sealed. A failed bar is a finding, not an embarrassment; a study that only publishes wins is marketing.

## Study A: blind identification test (the core claim)

Question: do outside raters identify goddesign output as AI-made at a rate equivalent to human-built pages, and below unskilled baselines?

Materials: 30 full-page captures (1280px screenshot plus the HTML):

- 10 goddesign runs across fixed varied briefs and both hosts (no two runs sharing a direction row).
- 10 unskilled baseline runs: the same 10 briefs, same host and model, with design skills disabled.
- 10 human-built pages: real shipped sites matched to the 10 brief domains, screenshotted the same way.

The frozen, executable design for the current run lives in `validation/studies/study-a-2026-07/protocol.md`, with the ten briefs and host assignments in `validation/studies/study-a-2026-07/briefs.json`. It replaces the underspecified parts of this overview before data collection begins.

Anonymization: `scripts/study-a-pack.mjs` validates all triplets, host pairing, green skill audits, and distinct direction rows; removes method-revealing comments without deleting neighboring CSS; assigns random sample IDs; hashes the HTML and screenshot; writes a sealed manifest; and creates two balanced waves of twenty rater assignments. `validation/tools/blind-eval-pack.sh` is its compatibility entry point. Pack all 30 through it, including the human-built ones, so no arm carries a distinguishing artifact.

Participant-visible payloads and the distributed hostname use neutral study
language. The method name must not appear in the URL, runtime study ID, client
bundle, sample filename, or rater instruction sheet.

Raters: 20 or more people who are not the author and have never read the deck or the Banned list (knowing the tells would contaminate the test). Each rater scores every sample in a random order, or a balanced random subset of 15 if fatigue is a concern. Per sample:

1. AI-made? yes / no / unsure.
2. Appeal: 1-5.
3. Trust: 1-5 ("you would give this page your email").
4. Prior familiarity with this exact site: yes / no, descriptive only.
5. Optional short reason for the AI verdict.

Pre-registered bars:

- Primary identification coding is yes = 1 and no or unsure = 0. Yes or unsure = 1 is a sensitivity analysis.
- Because each rater scores five samples from every arm, analysis is paired at the rater level.
- Core claim holds only if goddesign is equivalent to human-built within a fixed absolute margin of 0.15, with both one-sided paired randomization tests below 0.05, AND baseline identification is above goddesign with a one-sided paired randomization test below 0.05.
- Failure to detect a difference is not evidence of equivalence.
- Core claim fails if goddesign is identified at baseline rates. Report which samples failed and which features raters cited; that list is the next tells catalog input, per the refresh protocol.
- Appeal and trust are descriptive, no bar. Exception: a goddesign trust mean below the human mean reopens the Credibility axis work.

Collection: `study-a-rater/` is a persistent, de-identified rater application. It verifies signed invitation slots, enforces eligibility and consent, saves every answer to D1, resumes incomplete sessions, rejects invalid samples and malformed scales, closes only after all fifteen answers, and exports the sealed operator CSV behind a separate secret.

Analysis: `scripts/study-a-analyze.mjs` validates all twenty balanced slots against the sealed assignment plan, keeps the first complete eligible response per slot, flags duplicates, malformed data, impossible timing, and possible automation without silently excluding integrity flags, runs the frozen paired tests, reports the rater-cluster bootstrap interval, and publishes machine-readable plus Markdown results. The publication bundle re-runs from its own de-identified rows, includes the exact reproduction command and SHA-256 file manifest, seals private submission IDs, and emits deterministic recurring reason terms for recalibration.

Publish: the frozen protocol, briefs, corpus provenance, rater instruction sheet, sealed manifest after scoring closes, de-identified row-level CSV, analysis JSON, result report, and exact commands. The operator export with precise timestamps remains sealed.

## Study B: multi-brief matrix

The kilnhouse proof is one brief; some deck rows may only work for landing pages. Five briefs across categories:

1. SaaS analytics dashboard (Workbench-leaning, app frame).
2. Personal portfolio for a photographer (image-heavy).
3. E-commerce product page for a single physical product.
4. Documentation site for a developer tool.
5. Event page for a two-day conference.

Per brief, run the standard proof from `validation/runs/kilnhouse-2026-07/README.md`: one baseline (expect tells), one skill run per host (expect green gates), two same-brief DIVERGE runs (expect zero shared ledger axes). Screenshots or an honest DEGRADED for every run.

Bar: gates green on all skill runs, and the five per-host runs land on five distinct direction rows (the ledger enforces this mechanically; record that it did). A brief category where no row executes well is a deck gap: record it and either extend the deck or mark the row's `Fits:` line narrower.

## Study C: cross-model replication

All published runs to date are Claude-lane. The EXPAND lane exists for Codex-class models and has no independent receipts. Protocol: on a fresh machine or VM, install per `docs/INSTALL.md`, then run three of the Study B briefs under `$goddesign` with the default sandbox, collecting full artifacts (lock, stylesheet, audit JSON, screenshots).

Bar: gates green with zero operator intervention beyond the documented sandbox handoff. Any EXPAND-lane failure symptom that appears (placeholder floor, template snap-back, architecture instead of pixels) is a skill defect, not an operator error: record it in `validation/` and fix it at the rule level, never by patching the individual run.

## Cadence

- Study A: once per major release, or once a year, whichever comes first.
- Studies B and C: once per major release.
- Every run lands as a dated file in `validation/` with artifacts; the README badge updates only when Study A has external receipts, and it must then say so.
