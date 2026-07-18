# Validation round 2: Kilnhouse, 2026-07-18

Second validation of goddesign, run after two changes: (1) the sentiment-derived rules (see sentiment-evidence-2026-07.md) and (2) the new Step 3d seeded jitter. Same brief for all five runs: "Build a single-file index.html landing page for Kilnhouse, a studio management app for ceramics studios: class scheduling, kiln firing queue, member billing. Nav, hero, three feature sections, pricing with three tiers, footer. Production quality."

Hosts: Claude runs via Claude subagents (Fable 5 session); Codex runs via codex exec, gpt-5.6-sol, reasoning xhigh, workspace-write sandbox. Baselines had no skill; skill runs invoked goddesign. All five screenshotted with Playwright at 1280 (and 375). Skill-run claims were independently re-verified by grepping the emitted files, not taken from self-reports.

## Results

| Run | Direction / look | Gates | Verdict |
|---|---|---|---|
| claude-baseline | Green SaaS template: Inter body, hero dashboard mock card, invented "Trusted by 400+" logo strip, 8 ad-hoc radius values, IntersectionObserver scroll-reveal | n/a | Reproduces the tells catalog; see defects below |
| codex-baseline | Dark navy neon (cyan + pink glow), techno display, fake UI chrome in every section | n/a | Better than the 2026-07 first-round baseline (which converged on system fonts + cream), but a recognizable neon-glow template aesthetic |
| codex-skill | Luxury Serif row + Bento Anchor. Bodoni Moda / Manrope, platinum accent, radar signature | 29/29, DEGRADED (sandbox blocked browser) | Faithful row execution; jitter applied correctly via source-token pattern; one visual defect (below) |
| claude-skill-a | Terminal Core (amber) + Letter. IBM Plex Mono/Sans, prompt-prefixed headings, terminal queue readout | 30/30, visually verified (Playwright) | Clean; jitter h-4 verified; ceramics-literate copy |
| claude-skill-b | Swiss International + Manifesto. Archivo / Schibsted Grotesk, red signature rail, cardless pricing | 30/30, visually verified (Browser pane), rendered OKLCH measured against jittered tokens: exact match | Clean; jitter h-9 L-0.01 verified; fixed its own off-scale values during the sweep |

## The core promise test: A vs B

Same skill, same brief, same day. Zero overlap on any ledger axis:

| Axis | A | B |
|---|---|---|
| Direction | Terminal Core (amber) | Swiss International |
| Structure | Letter | Manifesto |
| Paper | dark | light |
| Display class | mono (row-legal) | grotesque |
| Accent hue | 72.4 (post-jitter) | 23.2 (post-jitter) |

## Jitter verification

All three skill runs applied Step 3d and recorded post-jitter values. Codex kept row hexes as `--bg-source`/`--accent-source` and derived jittered tokens with `oklch(from ...)`; run B measured the rendered values (accent oklch 0.603 0.218 23.2) against the lock and matched exactly. The mechanism works on both lanes with no hand-holding.

## Defects found (honest ledger)

1. **claude-baseline: scroll-reveal blanked the page.** The full-page static render shows the entire middle of the page empty; IntersectionObserver reveal left sections at opacity 0. The number-one motion tell from the sentiment study is also a functional failure. The skill's scroll-reveal cap plus the fallback rules in motion.md exist for exactly this.
2. **claude-baseline: honesty violations.** Invented logo strip ("Mudroom ATL", "Northfire Clay Co."...) and a fabricated live dashboard; both banned in the skill.
3. **codex-skill: overlapping calendar labels** ("Handbuilding" / "Wheel II" collide at 1280). Its run was DEGRADED because the sandbox blocked the browser, and the code-only re-check cannot catch layout collision. This validates the rule that DEGRADED is a weaker result and argues for giving Codex runs a renderer whenever possible.
4. **codex-baseline improved.** gpt-5.6-sol xhigh no longer ships the unstyled-Bootstrap floor; the gap the skill closes on the EXPAND lane is now mostly taste, template gravity, and discipline rather than raw styling absence.
5. **codex-baseline #2 (convergence re-measurement, codex-baseline-kilnhouse-2.html/png).** A second identical baseline run did NOT converge on run 1's neon template; instead it landed squarely on the catalogued cream + terracotta + serif attractor, with an Inter-first stack and no webfont import (silent fallback), a fabricated "trusted by" studio strip, pill-radius soup, and, critically, the same reveal bug as the Claude baseline: `.reveal { opacity: 0 }` gated on IntersectionObserver left the hero ghosted and the entire body blank in the full-page capture. Verdict: 5.6-sol has more baseline variance than the first validation round measured, but both baselines fell into catalogued attractor basins, and 2 of 3 unskilled runs across both vendors shipped pages that render blank statically.
6. **The reveal bug existed in the skill's own motion.md fallback** (static `opacity: 0` waiting for JS). Fixed same day: Recipe 2 now requires an `html.js` guard class, a 1.5s reveal timeout, and a print media rule, with a matching banned-motion entry and a new Motion gate ("page renders complete with JS disabled and in a full-page capture").

## Steering override test (claude-steer-kilnhouse.html/png)

Brief appended "make it look genuinely different, not like typical AI design". The run named its instinct (the cream/terracotta/serif reflex; the seeded row even matched it), executed the forced reroll differing on BOTH display class and accent hue band as the rule requires, stated it in the lock, and used the Phase 3 renderer chain (Playwright rung 1, five viewport probes, NOT DEGRADED). Result: warm near-black machine room, acid-yellow accent under 5 percent, dense mono firing table as the single signature, 30/30 gates. Fourth skill run, fourth fully distinct identity.

## Renderer chain test (codex-skill-kilnhouse-2.html/png)

Codex re-run after the Phase 3 renderer chain landed. Under the codex sandbox the chain behaved exactly as specified: attempted Playwright (named the denial: MachPortRendezvousServer), declared `DEGRADED: no visual check` honestly, and printed the exact operator command. The operator render came back clean at 1280 and 375: no collisions, no clipping (round 1's DEGRADED run had shipped a calendar-label collision). Bonus: the second EXPAND run chose a different direction from the first (Editorial Magazine + Stat-Led light vs Luxury Serif + Bento dark), so run-to-run divergence holds on the literal-execution lane too. Jitter present via the source-token pattern.

## Measured audit (scripts/audit.mjs)

Added after this round and validated against the round's own defect corpus. Per viewport (375/768/1280) it measures: horizontal overflow, text-on-text collisions (any element with direct text nodes, ancestor pairs excluded), text hidden at effective opacity 0 (the reveal bug; the 1700ms wait outlasts the 1500ms reveal-timeout guard so guarded pages pass and unguarded fail), sub-24px interactive targets, and webfonts that silently fell back (document.fonts loaded set vs computed families). JSON verdicts; exit 0/1/2; also emits the screenshots. Corpus results: caught claude-baseline's reveal blanking at all viewports, caught codex-baseline-2's reveal blanking AND its silent Inter fallback, caught codex-skill round 1's exact calendar collision (span "Handbuilding" x span "Wheel II"), confirmed claude-steer clean, and found one true issue human review had missed (run B's footer mail link at 177x19, under the 24px floor). Checklist Phase 3 now runs the audit as rung 0 with a bounded self-correction loop: fix only named failures, DIRECTION LOCK frozen, max 3 cycles, residuals reported.

## End-to-end audit gate test (claude-audit-e2e-dashboard.html/png)

A dense dashboard brief (chosen to maximize collision surface) run through the full skill AFTER the audit landed. The gate worked end to end: cycle 1 of the measured audit named 2 real failures (sub-24px text links, 93x22 and 127x15); the bounded self-correction loop fixed exactly those and nothing else, lock frozen; cycle 2 green; two later verification re-runs stayed green after the run's own scale-normalization fixes; webfont curl returned 200. Independent operator re-run of the audit: 0 failures at all three viewports, Poiret One and Josefin Sans confirmed loaded. Direction: Art Deco Geometric + Stat-Led (sixth distinct direction of the round; gold legal via the seed-selected-row exemption). Ledger, stamp, and audit screenshots all on disk.

## Sandboxed-Codex loop closed (scripts/codex-audit-loop.sh, codex-loop-signup.html/png)

The operational gap (sandboxed Codex could only hand off the audit) is closed by an operator wrapper: build inside the sandbox, audit outside it, feed failures back into the SAME session via `codex exec resume --last`, max 3 cycles. Proven live on a signup-page brief: the sandboxed build declared DEGRADED and wrote the machine-readable `audit-handoff.sh` (new checklist instruction, followed on first outing); the outside audit named 3 real FAQ overlaps (collapsed details/summary answers measurable as boxes); the resumed session diagnosed the root cause, fixed with `display: none` on closed answers, and held the lock (stamp and all 8 hexes unchanged); re-audit green at all viewports. A separate fix-contract test on the round-1 collision page also passed surgically (collision gone, fonts/stamp/palette untouched, +6 lines). Wrapper lessons encoded in the script: `resume` accepts only `-c` configs (sandbox via `-c sandbox_mode=...`), and it enforces the trust check without offering `--skip-git-repo-check`, so the wrapper `git init`s the run dir. Operator note: do not pipe the wrapper through `tail`; it masks exit codes.

## Cross-host image generation (scripts/genimage.sh, references/imagery.md, genimage-deco-kiln.png)

Codex CLI has built-in image generation (verified empirically: 1254px PNG on request). The skill now delegates: any host without native image tools (Claude included) calls `scripts/genimage.sh`, whose rung 1 shells out to codex; the chain is extensible to other image-capable CLIs (gemini, grok, kimi, cursor-agent are installed but untested for generation, so unclaimed). The discipline layer in `references/imagery.md` is the load-bearing part: the image prompt derives from the DIRECTION LOCK and is written into it (subject + row medium + locked hexes + composition + light + mandatory negative clauses against the generic AI-image look), one composition per page, no text in images, no generated people as customers/team, 200KB+ rasters as sibling files, 2-regeneration cap. Proof: a prompt built from the Art Deco dashboard's actual lock produced an image in exactly the four locked hexes, with fan/sunburst motifs, single glow-lit kiln subject, and negative space reserved in the upper third for the headline. Gate line added under Honesty.

## Verdict

Both lanes deliver under the updated skill: five skill runs, five committed, mutually distinct, gate-passing directions from one brief, with population-scale uniqueness backed by jitter rather than deck size alone. The steering override, renderer chain, and reveal guard all validated in behavior, not just on paper. Remaining operational advice: when running Codex sandboxed, run the printed handoff command afterward; the run will hand it to you.
