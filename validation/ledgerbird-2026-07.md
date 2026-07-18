# Validation round 3: Ledgerbird comparative, 2026-07-18

Second comparative round, new domain chosen for its different attractor pull: "Ledgerbird, bookkeeping software for freelance creatives" (the gravitational trap here is trustworthy-blue SaaS, not round 2's craft-terracotta). Matrix: 3 isolated goddesign runs vs 3 isolated frontend-design runs (Anthropic's official skill, goddesign standing rule waived per run) vs 1 no-skill control. Same brief, host, and prompt shape for all seven; every run audited externally with scripts/audit.mjs; self-reports verified against emitted code. Round-2 archive: archive/2026-07-kilnhouse/.

## Results

| Run | Concept | Display font | Paper | External audit |
|---|---|---|---|---|
| gd-a | Luxury Serif row worn as Manifesto: poster-scale didone declaratives, platinum accent | Bodoni Moda | dark | PASS all viewports |
| gd-b | Data-Dense Pro worn as a Letter from your bookkeeper, ruled ledger excerpts, chartreuse | Familjen Grotesk | dark | PASS (after 3 bounded fix cycles) |
| gd-c | Cinematic Dark specimen sheet, crimson-pink accent | Cormorant Garamond | dark | PASS (after 1 fix cycle) |
| fd-a | "Ink-and-ledger editorial", ledger-line texture | Young Serif | light | FAIL: reveal blanking at all viewports, overflow and targets at 375 |
| fd-b | "Banker's ledger paper, red margin rule" | Young Serif | light | FAIL: sub-24px targets at 375 (otherwise clean; best fd run of either round) |
| fd-c | "Ledger-paper editorial, red margin line" | Young Serif | light | FAIL: reveal blanking plus 6-7 text collisions at every viewport, overflow at 375 |
| base | Lavender-purple editorial SaaS, floating stat chips, gradient CTA band | Fraunces + Inter body | light | FAIL: collisions, targets |

## Convergence

**frontend-design: 3 of 3 converged this round, harder than round 2.** All three independently chose the ledger-paper concept; two specified the same red margin rule detail; all three chose Young Serif for display. Combined across both comparative rounds that makes **Young Serif in 5 of 6 frontend-design runs**, and a per-domain concept attractor is now legible: ceramics mapped to "porcelain and cobalt", bookkeeping maps to "ledger paper". The skill's one clever concept per subject feels creative once and is a fingerprint at scale. Device recipe again shared by all three: tilted/rotated ledger-card hero, marquee ticker strip, mono figures, alternating feature sections, scroll reveals.

**goddesign: 3 distinct directions, 3 display faces across 2 classes, 3 macrostructures.** Zero shared rows.

**Control:** the no-skill run landed in the predicted attractor on cue: lavender-purple SaaS (#5B4BDB family), Inter body, floating hero chips, gradient CTA band, invented logo strip.

## Honesty observations

fd-b's hero claims "Trusted by 12,400+ designers, writers, photographers": a fabricated adoption stat on a fictional product's first render. The control invented a customer logo strip. Both are catalogued honesty violations that goddesign's gate greps for; no goddesign run in any round has fabricated metrics, and gd-b/gd-c label their ledger figures as example data.

## Honest footnotes on goddesign

1. All three runs landed on dark paper this round (round 2 was dark/light/dark). Seeds roll independently in fresh directories with no shared ledger, so shared axes across projects can happen by chance; the axis-level rotation guarantee only holds within a project.
2. gd-c drew Cinematic Dark + Cormorant Garamond, the same row the kilnhouse round's third run drew. Cross-project row repetition is expected at 16-row deck scale (this is exactly what Step 3d jitter exists for, and it worked: accent hue 9 here vs 20 there, different structures worn). A future consideration: an optional user-level ledger for cross-project rotation.
3. gd-b consumed all 3 of its bounded fix cycles before going green; the cap held and the lock stayed frozen.

## Owner preference ranking (the metric the audit does not measure)

The project owner's complete ranking: fd-b first, gd-c a close second, gd-b third, gd-a fourth. Recorded as ground truth. The two-factor diagnosis the full ordering supports: product substance is the entry ticket, and formal boldness ranks among those that have it. The only page with no product substance (gd-a's pure manifesto, assertion without artifact) came last despite the most glamorous typography; the three substance-bearing pages (fd-b's ledger tables and invoices, gd-c's annotation tables, gd-b's ledger excerpts) ranked by how boldly their form carries that substance. Palette mood proved secondary: the dark theatrical gd-c nearly beat the warm fd-b. The catch: fd-b's winning move is the same subject-to-obvious-concept mapping that made all three fd runs identical and put Young Serif in 5 of 6, and fd-b still fabricated a trust stat and failed target sizes. Lesson encoded into the skill same day: the Step 4b Subject test (signature and at least one motif must be artifacts of the subject's world drawn in the locked direction's formal language; show the product working), a sharpened Specificity axis, and an explicit audience-fit remix trigger in Step 3c. Seed keeps supplying the form; the subject must now supply the matter.

## Verdict

The round-2 result reproduces on a hostile domain: goddesign 3 of 3 externally-verified green with three distinct committed directions; frontend-design 0 of 3 (one near-miss) with total concept-and-font convergence; the control fell into the exact catalogued attractor. Artifacts: ledgerbird-{gd,fd}-{a,b,c}.html/png, ledgerbird-base.html/png alongside this file.
