# Changelog

## Unreleased

### Evidence correction: one kilnhouse baseline withdrawn
- `validation/runs/kilnhouse-2026-07/codex-baseline-kilnhouse.html` / `.png` are withdrawn as a contaminated capture and renamed with a `WITHDRAWN-` prefix. The files are kept byte-unchanged; nothing was deleted. Finding, evidence, and affected claims: `validation/runs/kilnhouse-2026-07/WITHDRAWN-codex-baseline-kilnhouse.md`.
- The artifact was filed as an unskilled Codex baseline but carries a goddesign Persist stamp and reproduces `references/directions.md` row 4 (Retro-Futuristic) verbatim: all six hexes, the font pairing, a character-identical Google Fonts import, the radius, the border alpha, the motion duration, and the neon-glow signature. Six exact hexes plus an identical import string is a copy, not convergence, so the model read the decks from the repository the run happened in. Same failure mode v1.4.0 named for the Study A baselines, in an artifact that predates that runner check.
- It is not a mislabelled skill run either: no Step 3d jitter (zero `--*-source` tokens, and the stamp records the un-jittered row accent), a structure that contradicts the brief (Long Document is a 65ch essay column), honesty violations intact, and both genuine Codex skill runs already present under their own names. It read the decks without running the gate, so it is neither arm of the comparison.
- Confirmed mechanically by the repo's own v1.6.0 sweep: the artifact scores 0 failures, alongside the skill runs, while every one of the 18 other unskilled and frontend-design artifacts fails at 6 to 70. The v1.6.0 corpus-calibration line already excluded it without saying so; the README now says so.
- Claims corrected in place, originals left recoverable: the run README's codex-baseline results row; defect 4 ("codex-baseline improved"), now void, since the improvement it measured was the deck leaking in; defect 5's convergence and baseline-variance conclusion, now void, with its blank-render denominator corrected from 2-of-3 to 2-of-2; and the repository README's "three unskilled baseline runs", now two. The measured-audit corpus results, the seven-distinct-directions claim, the A-vs-B test, the steering and renderer-chain tests, the 3-vs-3 head-to-head, and the sealed Study A manifest never rested on it and are unchanged.

## v1.6.0 (2026-07-31)

The enforcement release. goddesign's QA gate had three phases, and only one of them was mechanical. Phase 1 is advisory by construction. Phase 3 is measured by `scripts/audit.mjs`, which needs Playwright and a browser and exits 2 without one. Phase 2, the pass/fail half meant to hold everywhere, was 40-plus assertions executed by the model that had just written the code, including the ones written as literal greps. In a sandbox, where the audit cannot run, a run could be declared gate-passing with nothing objective behind it. This release moves the greppable half to a script. No visual rule, craft-floor number, or banned pattern changes.

### The mechanical sweep
- `skills/goddesign/scripts/sweep.mjs`: 29 deterministic rules over source (`.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`), reporting file, line, and the offending value. No browser, no network, no model, no dependency. Exit 0 green, 1 named failures, 2 nothing scannable. `--rules` prints the table, `--json` emits machine-readable output.
- Rules: banned faces, mono in the body or display slot, Space Grotesk, silent font fallback, the indigo-violet family, gradient text, metallic premium shorthand, pure `#000`/`#FFF` bases, achromatic neutrals, hexes outside `:root`, `transition: all`, stray `!important`, inline styles, container accent stripes, `<hr>`, numbered chapter cadence, the band metronome and its 2x padding ratio, the reveal cascade, missing `:focus-visible`, missing `prefers-reduced-motion`, buzzword copy, em and en dashes in copy, the missing stylesheet stamp, token drift, off-scale spacing, the stock ornament kit, markup color literals, and reasonless waivers.
- Severity splits `fail` from `advisory`. Advisories never fail the gate because each has a legal case a script cannot read: a mono face in the slot a direction row states, a spacing value that is a grammar break declared in the lock, an ornament the locked row names.
- Waivers are inline, file-scoped, and must state a reason: `/* goddesign-allow: metallic-premium the Art Deco row is the one row that states metallics */`. A reason under 8 characters is itself reported as `waiver-without-reason`, so the escape hatch cannot be used silently.
- Comments are blanked before every rule scan (indices and line numbers preserved), so a DIRECTION LOCK block quoting a banned hex, or a note reading "the one allowed `!important` kill switch", is never a finding. Waivers are read first, off the raw text.

### Extension mode, measured instead of inferred
- `skills/goddesign/scripts/extract-tokens.mjs`: reads W3C design-token JSON (including the `tokens/*.json` skillui emits), CSS custom properties, `@theme` blocks, Tailwind config, and `@font-face` and import declarations. Resolves the five DIRECTION LOCK role slots plus border, and reports fonts, radii, spacing, imports, and the palette by frequency. A role it cannot resolve is named as unresolved, never guessed. Exit 2 (`NO DESIGN SYSTEM FOUND`) is the greenfield answer: roll the seed and take the full path.
- `sweep.mjs --tokens <baseline.json>` reports every hex, font, and radius the build introduced that the baseline does not have. Step 0 item 1 and the QA gate now state extension mode as values rather than as a comparison done by eye.

### Gate wiring
- `references/checklist.md`: Phase 2 splits into 2a (run the sweep, fix what it names, lock frozen) and 2b (the assertions needing judgment, a render, or the lock in hand). Assertions the sweep decides are marked `[sweep]`. The rule table, waiver syntax, and the extension-mode two-command loop are documented there.
- The sweep and the audit are stated as complements: static analysis cannot see a collision, a clipped label, or a blank band; a render cannot see a banned value behind a lock that never shipped. Neither one green makes the other unnecessary and neither one unavailable excuses skipping the other. A `DEGRADED: no visual check` run must now report which half of the gate did run.
- `SKILL.md` Step 0 item 1 and Step 5 route through the two scripts; `verify-install.sh` lists both as optional (the run degrades honestly without them).
- `scripts/lint-decks.mjs` gained 95 checks, from 215 to 310. The script's rule table and the deck's rule table are one contract in two files: every rule id and severity must appear in both, and a rule documented but not implemented fails the build.

### Corpus calibration
- Both scripts were run over the whole existing validation corpus. 14 of 19 goddesign artifacts exit 0; the five with findings carry six failures in total, and every one was inspected and is a true positive against a rule the skill already had (a numbered chapter cadence the ban post-dates, a raw hex in `.btn-primary:active`, an em dash in copy, a 3px colored left border on a container, two distinct section paddings where the gate wants three). All 18 unskilled and frontend-design artifacts fail, at 6 to 70 findings each.
- Four false positives were found and fixed during calibration, and a fifth rule was narrowed rather than removed: a colored side border is reported only on a container, so a drawn rail or route line is not a card stripe.
- `scripts/sweep.test.mjs` plus a CI step: 19 executable tests covering the rule table, the waiver contract, each fixed false positive, the extraction round trip, and the corpus separation itself, so the calibration is asserted on every push instead of claimed in prose.
- This is a false-positive and separation check on artifacts that already existed. It is not predictive evidence, and the evidence badge is unchanged.

### Evaluation record
- `validation/research/design-skills-evaluation-2026-07.md`: the borrow-and-decline record for three public design skills. impeccable (pbakaus, Apache 2.0) supplied the deterministic-detector diagnosis, the severity split, and inline waivers; skillui (amaancoderx, MIT) supplied static token extraction; ui-ux-pro-max (nextlevelbuilder, MIT) supplied token-conformance validation as a gate.
- Declined: impeccable's 23-command surface, its four modes (advice, not mechanism), its per-host edit-time hook manifests (four host-specific config files against a documented host-agnostic constraint), its live browser mode (a network service core design work must not need), its PRODUCT.md/DESIGN.md context layer, and its 59-rule registry (on the evidence bar, not on quality: a tell enters goddesign through three sourced complaints or a reproduced defect). Declined from ui-ux-pro-max: the 84-style and 192-palette catalogue (uncapped decks cannot carry the accent and depth caps `lint-decks.mjs` enforces) and the requirements-to-pattern generator (the convergence engine this skill exists to fight). Declined from skillui: the URL crawl, ultra mode, and `.skill` packaging (the network half).
- No text, code, rule definition, prompt content, or data file was copied from any of the three. Both new scripts implement goddesign's own checklist and Banned list.
- `CONTRIBUTING.md` gained the mechanization step: a statically detectable tell now becomes a sweep rule and a checklist row in the same change, with its corpus split reported in the pull request. A rule that fires on the clean corpus is narrowed, never merged with a note.

## v1.5.0 (2026-07-31)

The scope release. Every mechanism in goddesign was scoped to a single run, and the only artifact that outlived a run was a ledger whose job is to make the next run differ. This release adds the missing scale: an effort too big for one session. Nothing about a single-surface design run changes.

### The design map
- `skills/goddesign/references/map.md`: a new required deck. An effort naming 3 or more distinct surfaces, stating a hand-off, or finding an existing `.design-map.md` charts a map first: a **Destination** that fixes the scope, one **System lock** (a DIRECTION LOCK rolled once, jitter included, that every surface inherits verbatim), **Surfaces locked** as links plus one-line gists, **Surfaces to design** each carrying its one action, audience, and claim slot, **Not yet specified** for fog, **Out of scope** for work past the destination, and **Open questions** for the facts only a person can supply.
- Charting is one session and produces no pixels. After that, one surface per session, gated in full.
- The threshold is deliberately narrow: two surfaces or fewer in one session skips the map, and charting that surfaces fewer than 3 specifiable surfaces ends by deleting the map and designing directly.

### Three inversions the map fixes
- **The seed rolls once per map**, at charting, not once per surface. Surface sessions never re-roll, never re-jitter, and never re-read `directions.md`; siblings shipping different accents was the failure this prevents.
- **Rotation matches instead of differing.** Step 3a exists to push the next run off the last one, which is right across projects and backwards across the surfaces of one product. Under a map it applies at charting only.
- **One ledger entry per map, not one per surface.** Nine surfaces written as nine entries trip the Step 3a popularity cap by the third surface and fill the entire 8-entry rotation window with one project. The entry is written when the map's last surface locks.

### Human-only facts stop stalling and stop being invented
- Step 2 says invent confidently where the brief is silent; Step 4c forbids inventing metrics, testimonials, logos, and company names. Under a map, a surface never blocks on the collision: it ships a placeholder labeled as a placeholder and parks the dated question under **Open questions**. These are the only map items an agent may not answer itself.

### Mechanical enforcement
- `skills/goddesign/scripts/verify-map.mjs`: validates the eight required sections and their order, the System lock's seven fields and five hex tokens, every surface line's shape, claim format (`no` or `YYYY-MM-DD <host>`), dated open questions, and one-surface-one-state. Exit 0 green, 1 named failures, 2 no map. Prints the owed-ledger-entry reminder when a map completes.
- `scripts/lint-decks.mjs` gained 17 checks binding the deck, the validator, and the skill wiring together: the validator's required-section list is read at lint time, so the deck's template and the script cannot drift apart.
- `references/checklist.md` gained a Map gate group (claim taken before work, lock inherited verbatim, sibling accent and fonts identical, macrostructure differs from the previous surface, fog graduated, no premature ledger entry), and Phase 1 axis 6 now inverts under a map: drifting from the system scores 1, and so does shipping the previous surface's skeleton with new copy.
- `references/map.md` joins the required set, so `verify-install.sh` now checks eight decks rather than seven.

### Dependency advisories (unrelated to the map; CI had gone red since v1.4.0)
- `react-server-dom-webpack` 19.2.6 to 19.2.8, with `react` and `react-dom` 19.2.6 to 19.2.8 to satisfy its peers, clearing GHSA-wx67-qw84-cm4g (react-server-dom denial of service in server functions). Every peer range still holds: `next@^16.2.11` accepts `^19.0.0`, `vinext@0.0.50` accepts `^19.2.6`.
- `brace-expansion` pinned per major line by override (`^1.0.0` to 1.1.18, `^5.0.0` to 5.0.9), which clears GHSA-3jxr-9vmj-r5cp and the 5.x line.
- The remaining 9 advisories are the eslint toolchain, reachable only through `minimatch@3.1.5` (the last 3.x release, pinned to `brace-expansion ^1.1.7`). GHSA-mh99-v99m-4gvg lists no patched 1.x, and 5.x cannot substitute: its CommonJS build exports an object, so `minimatch@3` throws `expand is not a function`. Verified, not assumed. The npm-suggested fix (eslint 10, semver major) does not clear it either, because `eslint-config-next@16.2.6` still pulls `minimatch@3` through eslint-plugin-import, jsx-a11y, and react.
- So the CI gate is now scoped rather than weakened: `npm audit --audit-level=high --omit=dev` blocks on the production surface that actually ships to raters (currently zero advisories at any severity), and a second non-blocking step runs the full tree so dev-only drift stays visible in the logs.

### Evaluation record
- `validation/research/wayfinder-evaluation-2026-07.md`: the borrow-and-decline record for the wayfinder skill (mattpocock/skills, MIT). Seven structural disciplines shipped. Declined: the issue-tracker substrate (core design work depends on no account or network service), blocking edges (design surfaces are an ordering, not a dependency graph, once the System lock exists), the four ticket types and their sub-skills (another skill's ecosystem; only the human-in-the-loop distinction survives), parallel research subagents (same cost and Codex-guarantee reasoning that declined ADHD's fan-out), and planning-by-default (the inversion that would turn a design skill into a planning skill). No text or code was copied.
- The record states the mechanism's weight honestly: it is derived from rules already in the skill and verified mechanically, not from a failing validation run, and no multi-surface map has been run end to end yet. It ships with a kill criterion recorded in advance.

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
